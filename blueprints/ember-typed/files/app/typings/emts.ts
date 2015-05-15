/// <reference path="./DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember';

module EmTs {
	interface IEmberHelper {
		_computed: IComputed[];
		_property: IProperty[];
		_action: IAction[];
		_needs: INeeds[];
	}
	
	interface IComputed {
		key: symbol;
		arguments: string[];
	}
	
	interface IProperty {
		key: symbol;
		bind: string;
	}
	
	interface IAction {
		key: symbol;
	}
	
	interface INeeds {
		key: symbol;
		needs: string;
		bind: string;
	}
	
	export function Computed(...args: string[]) {
		return (target: IEmberHelper, key: symbol, value: any) => {
			target._computed = target._computed || [];
			target._computed.push(<IComputed>{key: key, arguments: args});
			return {};
		}
	}
	
	
	export function Property(bind: string = null) {
		return (target: IEmberHelper, key: symbol) => {
			target._property = target._property || [];
			target._property.push(<IProperty>{key: key, bind: bind || key});
		}
	}
	
	export function Action(target: IEmberHelper, key: symbol, value: any) {
		target._action = target._action || [];
		target._action.push(<IAction>{key: key});
		return {};
	}
	
	export function Needs(needs: string, bind: string) {
		return (target: IEmberHelper, key: symbol) => {
			target._needs = target._needs || [];
			target._needs.push(<INeeds>{key: key, needs: needs, bind: bind});
		}
	}
	
	export class EmObject {
		constructor(protected native_ember_object: Ember.Object) {
		}
		
		static getMixinFor(T) {
			var tmp = {
				__typescript: function() {
					this.__typescript = new T(this);
					
					let this_ = <IEmberHelper><any>this.__typescript;
					
					//init properties
					if (this_._property) {
						this_._property.forEach((x) => {
							if (this_[x.key] !== undefined) {
								this.set(x.key, EmObject.returnNative(this_[x.key]));
							}
							
							//install get/set proxy
							Object.defineProperty(this.__typescript, <string><any>x.key, {
								get: () => {
									return EmObject.returnTyped(this.get(x.bind));
								},
								set: (value) => {
									this.set(x.bind, EmObject.returnNative(value));
								}
							});
						});
					}
					
					//init needs
					if (this_._needs) {
						this_._needs.forEach((x) => {
							//install get proxy
							Object.defineProperty(this.__typescript, <string><any>x.key, {
								get: () => {
									return this.get(x.bind);
								}
							});
						});
					}
					
					//uhm .. refresh computed ? why do i need this ?
					/*
						But fixes the "doesn't react to changes"-Bug
					*/
					if (this_._computed) {						
						Ember.run.next(this, () => {
							this_._computed.forEach((x) => {
								this.get(x.key);
							});
						});
					}
					
					//console.log("Inited EmTs for Ember", this.__typescript);
				}.on("init")
			};
			
			var this_ = <IEmberHelper>(<any>T).prototype;
			
			//setup properties
			if (this_._property) {
				this_._property.forEach((x) => {
					tmp[x.key] = EmObject.returnNative(this_[x.key]);
				});
			}
			
			//setup computed 
			if (this_._computed) {
				this_._computed.forEach((x) => {
					tmp[x.key] = Ember.computed.apply(this, <any[]>x.arguments.concat(function (key, value) {
						return EmObject.returnNative(this.__typescript[x.key].apply(this.__typescript, [key, EmObject.returnTyped(value)]));
					}));
				});
			}
			
			//setup actions, can only be when view, component, route.. but who cares ?
			if (this_._action) {
				tmp["actions"] = this_._action.reduce((prev: any, current) => {
					prev[current.key] = function(...args: any[]) {
						return this.__typescript[current.key].apply(this.__typescript, EmObject.returnTyped(args));
					};
				}, {});
			}
			
			//setup needs
			if (this_._needs) {
				tmp["needs"] = this_._needs.map((x) => {
					return x.needs;
				});
			}
			
			return tmp;
		}
		
		static getProxyClassFor(name:string, T) : Ember.Object {
			var tmp = Ember.Object.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return <Ember.Object>tmp;
		}
		
		static returnNative(value: any): any {
			if (value === undefined || value === null) {
				return value;
			}
			//get native ember objects
			let isArray = Ember.$.isArray(value);
			value = [].concat(value).map((x) => {
				if (x !== undefined && x !== null && x instanceof EmObject) {
					return x.native_ember_object;
				}
				return value;
			});
			return isArray ? value : value[0];
		}
		
		static returnTyped(value: any): any {
			if (value === undefined || value === null) {
				return value;
			}
			//get typed objects
			let isArray = Ember.$.isArray(value);
			value = [].concat(value).map((x) => {
				if (x !== undefined && x !== null && x.__typescript !== undefined) {
					return x.__typescript;
				}
				return value;
			});
			return isArray ? value : value[0];
		}
	}
	
	export class Route extends EmObject {
		constructor(public route: Ember.Route) {
			super(route);
		}
		
		static isPromise(value: any): boolean {
			// http://stackoverflow.com/questions/13075592/how-can-i-tell-if-an-object-is-a-jquery-promise-deferred
		    if (typeof value.then !== "function") {
		        return false;
		    }
		    var promiseThenSrc = String($.Deferred().then);
		    var valueThenSrc = String(value.then);
		    return promiseThenSrc === valueThenSrc;
		}
		
		static getMixinFor(T) {
			var tmp = EmObject.getMixinFor(T);
			tmp["model"] = function(...args: any[]) {
				var res = this.__typescript["model"] ? this.__typescript["model"].apply(this.__typescript, EmObject.returnTyped(args)) : undefined;
				if (Route.isPromise(res)) {
					return res.then((data) => {
						return EmObject.returnNative(data);
					});
				}
				return EmObject.returnNative(res);
			};
			return tmp;
		}
		
		static getProxyClassFor(name: string, T) : Ember.Route {
			var tmp = Ember.Route.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return <Ember.Route>tmp;
		}
	}
	
	export class Controller extends EmObject {
		constructor(public controller: Ember.Controller) {
			super(controller);
		}
		
		static getProxyClassFor(name: string, T) : Ember.Controller {
			var tmp = Ember.Controller.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return <Ember.Controller>tmp;
		}
	}
	
	export class View extends EmObject {
		constructor(public view: Ember.View) {
			super(view);
		}
		
		static getMixinFor(T) {
			let tmp = EmObject.getMixinFor(T);
			tmp["__init_view"] = function() {
				//these props can't be dynamicaly changed..
				let props = ["ariaRole", "attributeBindings", "childViews", "classNameBindings", "classNames", "concatenatedProperties", "elementId", "layoutName"];
				props.forEach((x) => {
					this.set(x, EmObject.returnNative(this.__typescript[x] || this.get(x)));
				});
			}.on("init");
			return tmp;
		}
		
		static getProxyClassFor(name: string, T) : Ember.View {
			var tmp = Ember.View.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return <Ember.View>tmp;
		}
	}
	
	export class Component extends View {
		constructor(public component: Ember.Component) {
			super(component);
		}
		
		static getProxyClassFor(name: string, T) : Ember.Component {
			var tmp = Ember.Component.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return <Ember.Component>tmp;
		}
	}
}

export default EmTs;
