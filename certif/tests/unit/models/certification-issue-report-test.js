import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CANDIDATE_INFORMATIONS_CHANGES } from 'pix-certif/models/certification-issue-report';

module('Unit | Model | certification issue report', function(hooks) {
  setupTest(hooks);

  module('#displayCategory', function() {

    test('it should display the name of the category', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('certification-issue-report', { categoryId: CANDIDATE_INFORMATIONS_CHANGES });
      assert.equal(model.displayCategory, 'Modification infos candidat');
    });
  });
});
