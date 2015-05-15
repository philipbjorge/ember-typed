/// <reference path="<%= appRoot %>/typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember';
import EmTs from '<%= appRoot %>/typings/emts';

class <%= classifiedModuleName %>Route extends EmTs.Object {
    @EmTs.Property() id: number;
    
	constructor(object: Ember.Object) {
		super(object);
	}	
}

export {<%= classifiedModuleName %>Object};
export default EmTs.Object.getProxyClassFor("<%= classifiedModuleName %>Object", <%= classifiedModuleName %>Object);
