/// <reference path="<%= appRoot %>/typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember = require("Ember");
import EmTs from '<%= appRoot %>/typings/emts';

class <%= classifiedModuleName %>Component extends EmTs.Component {
	constructor(controller: Ember.Component) {
		super(controller);
	}
}

export {<%= classifiedModuleName %>Component};
export default EmTs.Component.getProxyClassFor("<%= classifiedModuleName %>Component", <%= classifiedModuleName %>Component);
