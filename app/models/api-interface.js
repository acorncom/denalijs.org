import Ember from 'ember';
import DS from 'ember-data';

const attr = DS.attr;
const belongsTo = DS.belongsTo;
const { alias } = Ember.computed;

const ApiInterface = DS.Model.extend({

  name: attr('string'),
  pkg: attr('string'),
  description: attr('string'),
  file: attr('string'),
  line: attr('number'),
  deprecated: attr('boolean'),
  internal: attr('boolean'),
  since: attr('string'),
  parentClass: attr('string'),
  parentInterface: attr('string'),

  api: belongsTo('api'),

  shortDisplayName: alias('name')

});

ApiInterface.reopenClass({
  idFor(version, pkg, name) {
    return `${ version.id || version }:${ pkg }:${ name }`;
  }
});

export default ApiInterface;