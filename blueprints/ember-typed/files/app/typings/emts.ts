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
						for(let i = 0; i < this_._property.length; ++i) {
							let property = this_._property[i];

							if (this_[property.key] !== undefined) {
								this.set(property.key, this_[property.key]);
							}
							
							//install get/set proxy
							Object.defineProperty(this.__typescript, <string><any>property.key, {
								get: () => {
									let tmp = this.get(property.bind);
									if (tmp.__typescript !== undefined) {
										return tmp.__typescript;
									}
									return tmp;
								},
								set: (value) => {
									if (value.__typescript !== undefined) {
										this.set(property.bind, value.__typescript.native_ember_object);
										return;
									}
									this.set(property.bind, value);
								}
							});
						}
					}
					
					//init needs
					if (this_._needs) {
						for(let i = 0; i < this_._needs.length; ++i) {
							let needs = this_._needs[i];
							
							//install get proxy
							Object.defineProperty(this.__typescript, <string><any>needs.key, {
								get: () => {
									return this.get(needs.bind);
								}
							});
						}
					}
					
					//uhm .. refresh computed ? why do i need this ?
					/*
						But fixes the "doesn't react to changes"-Bug
					*/
					if (this_._computed) {
						Ember.run.next(() => {
							for(let i = 0; i < this_._computed.length; ++i) {
								let computed = this_._computed[i];
								
								this.get(computed.key);
							}
						});
					}
					
					//console.log("Inited EmTs for Ember", this.__typescript);
				}.on("init")
			};
			
			var this_ = (<any>T).prototype;
			
			//setup properties
			if (this_._property) {
				for(let i = 0; i < this_._property.length; ++i) {
					let property = this_._property[i];
					if (this_[property.key] !== undefined) {
						tmp[property.key] = this_[property.key];
					}
				}
			}
			
			//setup computed 
			if (this_._computed) {
				for(let i = 0; i < this_._computed.length; ++i) {
					let computed = this_._computed[i];
					
					let params = <any[]>computed.arguments.slice(0);
					params.push(function (key, value) {
						if (value !== undefined && value.__typescript !== undefined) {
							value = value.__typescript;
						}
						let tmp = this.__typescript[computed.key].apply(this.__typescript, [key, value]);
						if (tmp.__typescript !== undefined) {
							return tmp.__typescript.native_ember_object
						}
						return tmp;
					});
					
					tmp[computed.key] = Ember.computed.apply(this, params);
				}
			}
			
			//setup actions, can only be when view, component, route.. but who cares ?
			if (this_._action) {
				tmp["actions"] = {};		
				for(let i = 0; i < this_._action.length; ++i) {
					let action = this_._action[i];
					
					tmp["actions"][action.key] = function(...args: any[]) {
						return this.__typescript[action.key].apply(this.__typescript, args);
					}				
				}
			}
			
			//setup needs
			if (this_._needs) {
				tmp["needs"] = [];
				for(let i = 0; i < this_._needs.length; ++i) {
					let needs = this_._needs[i];
					
					tmp["needs"].push(needs.needs);
				}
			}
			
			return tmp;
		}
		
		static getProxyClassFor(name:string, T) : Ember.Object {
			var tmp = Ember.Object.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return tmp;
		}
	}
	
	export class Route extends EmObject {
		constructor(public route: Ember.Route) {
			super(route);
		}
		
		static getMixinFor(T) {
			var tmp = EmObject.getMixinFor(T);
			tmp["model"] = function(...args: any[]) {
				return this.__typescript["model"] ? this.__typescript["model"].apply(this.__typescript, args) : undefined;
			};
			return tmp;
		}
		
		static getProxyClassFor(name: string, T) : Ember.Route {
			var tmp = Ember.Route.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return tmp;
		}
	}
	
	export class Controller extends EmObject {
		constructor(public controller: Ember.Controller) {
			super(controller);
		}
		
		static getProxyClassFor(name: string, T) : Ember.Controller {
			var tmp = Ember.Controller.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return tmp;
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
				for (var i = 0; i < props.length; ++i) {
					this.set(props[i], this.__typescript[props[i]] || this.get(props[i]));
				}
			}.on("init");
			return tmp;
		}
		
		static getProxyClassFor(name: string, T) : Ember.View {
			var tmp = Ember.View.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return tmp;
		}
	}
	
	export class Component extends View {
		constructor(public component: Ember.Component) {
			super(component);
		}
		
		static getProxyClassFor(name: string, T) : Ember.Component {
			var tmp = Ember.Component.extend(this.getMixinFor(T));
			tmp[Ember.NAME_KEY] = name;
			return tmp;
		}
	}
}

export default EmTs;
