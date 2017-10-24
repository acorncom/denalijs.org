import Ember from 'ember';

const hash = Ember.RSVP.hash;

export default Ember.Route.extend({

  model() {
    let version = this.modelFor('docs');
    return hash({
      version,
      guides: version.get('guides')
    });
  }

});
