/// <reference path="<%= appRoot %>/typings/DefinitelyTyped/ember/ember.d.ts"/>
import Ember from 'ember';
import EmTs from '<%= appRoot %>/typings/emts';

class <%= classifiedModuleName %>View extends EmTs.View {
	constructor(view: Ember.View) {
		super(view);
	}
}

export {<%= classifiedModuleName %>View};
export default EmTs.View.getProxyClassFor("<%= classifiedModuleName %>View", <%= classifiedModuleName %>View);
