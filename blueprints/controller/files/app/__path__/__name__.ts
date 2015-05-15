/// <reference path="<%= appRoot %>/typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember';
import EmTs from '<%= appRoot %>/typings/emts';

class <%= classifiedModuleName %>Controller extends EmTs.Controller {
	constructor(controller: Ember.Controller) {
		super(controller);
	}
}

export {<%= classifiedModuleName %>Controller};
export default EmTs.Controller.getProxyClassFor("<%= classifiedModuleName %>Controller", <%= classifiedModuleName %>Controller);
