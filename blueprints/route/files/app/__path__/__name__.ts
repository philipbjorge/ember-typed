/// <reference path="<%= appRoot %>/typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember = require("Ember");
import EmTs from '<%= appRoot %>/typings/emts';

class <%= classifiedModuleName %>Route extends EmTs.Route {
    model() {
        return null;
    }

	constructor(route: Ember.Route) {
		super(route);
	}
}

export {<%= classifiedModuleName %>Route};
export default EmTs.Route.getProxyClassFor("<%= classifiedModuleName %>Route", <%= classifiedModuleName %>Route);
