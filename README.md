# ember-typed

**THIS IS AN EXPERIMENT**   
**SHOULD NOT BE USED FOR PRODUCTION !**
**THATS SAID, I THINK IT'S PRETTY USEABLE..**

Adds typescript support to ember-cli. 

# Blueprints
 * ember g ember-typed  
   *Needs to be done once ! Copies the typescript files to your project*
 * ember g route
 * ember g controller
 * ember g view
 * ember g object
 * ember g component

# Classes
 * EmTs.EmObject   
  *Not EmTs.Object because of name resolve problems.. might be solveable*
 * EmTs.Controller
 * EmTs.View
 * EmTs.Component
 * EmTs.Route

# Annotations
 * @Property(name)
 * @Computer(dep1, dep2, dep3, ...)
 * @Action
 * @Needs(name, bind-name)

# How to access ember-obj from ts-obj

* EmTs.Controller: **this.controller**
* EmTs.Route: **this.route**
* EmTs.View: **this.view**
* EmTs.Component: **this.component**
* EmTs.\*: **this.native_ember_object**

# Examples
Object
----
```ts
/// <reference path="./../typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember';
import EmTs from './../typings/emts';

class ItemObject extends EmTs.EmObject {
	@EmTs.Property() userId: number;
	@EmTs.Property() id: number;
	@EmTs.Property() title: string;
	@EmTs.Property() body: string;
	
	@EmTs.Computed("title")
	bigTitle() {
		return this.title.toUpperCase();
	}
	
	//Computed-Property via get
	@EmTs.Computed("body")
	get bigBody() {
		return this.body.toUpperCase();
	}
	//and set
	set bigBody(value: string) {
		//not that this makes sense..
		this.body = value;
	}
	
	
	constructor(object: Ember.Object) {
		super(object);
	}
}

export {ItemObject};
export default EmTs.EmObject.getProxyClassFor("ItemObject", ItemObject);
```

Route
----
```ts
/// <reference path="./../typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember';
import EmTs from './../typings/emts';
import Item from './../models/item';
import {ItemObject} from './../models/item';

class DemoRoute extends EmTs.Route {

	//INFO: no idea why I need the (<any>Item) cast, shouldn't be required.. 
	
	model(): ItemObject[] {
		return Ember.$.getJSON("http://jsonplaceholder.typicode.com/posts")
		.then((data) => {
			return data.map((x) => {
				return new ItemObject((<any>Item).create(x));
			});
		});
	}
	
	/*
	Or return ember objects
	    
    model(): Item[] {
	    return Ember.$.getJSON("http://jsonplaceholder.typicode.com/posts")
	    .then((data) => {
		    return data.map((x) => {
			    return (<any>Item).create(x);
		    });
	    });
	}
    */
	
	constructor(route: Ember.Route) {
		super(route);
	}
	
}

export {DemoRoute};
export default EmTs.Route.getProxyClassFor("DemoRoute", DemoRoute);
```

Controller
----
```ts
/// <reference path="./../typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember'
import EmTs from './../typings/emts';

class DemoController extends EmTs.Controller {
	@EmTs.Property() model: ItemObject[];
	
	@EmTs.Computed("model", "model.@each")
	count(): number {
		return this.model.length;
	}

	constructor(controller: Ember.Controller) {
		super(controller);
	}
	
}

export {DemoController};
export default EmTs.Controller.getProxyClassFor("DemoController", DemoController);
```

View
----
```ts
/// <reference path="./../typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember'
import EmTs from './../typings/emts';

class DemoView extends EmTs.View {

	constructor(view: Ember.View) {
		super(view);
	}
	
}

export {DemoView};
export default EmTs.View.getProxyClassFor("DemoView", DemoView);
```

Component
----
```ts
/// <reference path="./../typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember'
import EmTs from './../typings/emts';
import Item from './../models/item';
import {ItemObject} from './../models/item';

class XDemoComponent extends EmTs.Component {
	@EmTs.Property() item: ItemObject;
	@EmTs.Property() display: boolean = false;
	
	constructor(controller: Ember.Component) {
		super(controller);
	}
	
	@EmTs.Action
	toggle() {
		this.display = !this.display;
	}
}

export {XDemoComponent};
export default EmTs.Component.getProxyClassFor("XDemoComponent", XDemoComponent);
```
