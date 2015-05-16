# ember-typed - Ember with Typescript

**THIS IS AN EXPERIMENT**   
**SHOULD NOT BE USED FOR PRODUCTION !**  
**THATS SAID, I THINK IT'S PRETTY USEABLE..**

This AddOn makes it possible to write Ember-Applications with Typescript `1.5+`.
It adds wrappers for `Ember.Object`, `Ember.Route`, `Ember.Controller`, `Ember.View` and `Ember.Component`.

Annotations are used to mark properties as `Property`, `Computed`, `Action` and `Needs`.

Basic structor of a typed Ember class
---
First the includes (*Note: blueprints will generated these parts for you*)
```typescript
/// <reference path="./../typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember';
import EmTs from './../typings/emts';
```
followed with your class
```typescript
class MyObject extends EmTs.EmObject {
	constructor(obj) {
		super(obj);
	}
}
```
them the exports, first the export of your typed class, so it can be used outside
```typescript
export {MyObject};
```
and the default export for ember
```typescript
export default EmTs.EmObject.getProxyClassFor("MyObject", MyObject);
```

# Blueprints
Everytime you update this AddOn you probably will need to run `ember g ember-typed`!
This will copy the typescript files into your project.  
Why aren't these files merged while building ? Because this way you will have autocompletion..
 
 * `ember g route`
 * `ember g controller`
 * `ember g view`
 * `ember g object`
 * `ember g component`

# Classes you can extend from
 * `EmTs.EmObject`
  *Not EmTs.Object because of name resolve problems.. might be solveable*
 * `EmTs.Controller`
 * `EmTs.View`
 * `EmTs.Component`
 * `EmTs.Route`

# Annotations
 * `@Property(name)`
 		Can Be used at properties, if name is not definied the name of the property will be used.
 * `@Computer(dep1, dep2, dep3, ...)`
 		Can be used at functions or set/get-functions
 * `@Action`
 		Can be used at functions, the action will have the name of the function.
 * `@Needs(name, bind-name)`

# How to access ember-obj from ts-obj

* `EmTs.Controller`  
	with `this.controller`
* `EmTs.Route`   
	with `this.route`
* `EmTs.View`    
	with `this.view`
* `EmTs.Component`   
	with `this.component`
* or with `this.native_ember_object`

# Some examples
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
	bigTitle(key, value) {
		if (value !== undefined) {
			this.title = value;
		}
		return this.title.toUpperCase();
	}
	
	//Computed-Property via get
	@EmTs.Computed("body")
	get bigBody() {
		return this.body.toUpperCase();
	}
	//and set
	set bigBody(value: string) {
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
	model(): ItemObject[] {
		return Ember.$.getJSON("http://jsonplaceholder.typicode.com/posts")
		.then((data) => {
			return data.map((x) => {
				//INFO: no idea why I need the (<any>Item) cast, shouldn't be required..
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
