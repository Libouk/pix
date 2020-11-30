import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { OTHER } from 'pix-certif/models/certification-issue-report';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Integration | Component | examiner-report-modal', function(hooks) {
  setupRenderingTest(hooks);

  const RADIO_BUTTON_OF_TYPE_OTHER_SELECTOR = '#input-radio-for-type-other';
  const LABEL_FOR_RADIO_BUTTON_OF_TYPE_OTHER_SELECTOR = 'label[for="input-radio-for-type-other"]';
  const TEXT_AREA_OF_TYPE_OTHER_SELECTOR = '#text-area-for-type-other';
  const REPORT_INPUT_LENGTH_INDICATOR = '.examiner-report-modal-content__char-count';

  test('it show candidate informations in title', async function(assert) {
    // given
    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      examinerComment: null,
      hasSeenEndTestScreen: false,
    });
    const closeExaminerReportModalStub = sinon.stub();
    this.set('closeExaminerReportModal', closeExaminerReportModalStub);
    this.set('reportToEdit', report);
    this.set('maxlength', 500);

    // when
    await render(hbs`
      <ExaminerReportModal
        @closeModal={{this.closeExaminerReportModal}}
        @report={{this.reportToEdit}}
        @maxlength={{@examinerCommentMaxLength}}
      />
    `);

    // then
    const reportModalTitleSelector = '.examiner-report-modal__title h3';
    assert.dom(reportModalTitleSelector).hasText('Lisa Monpud');
  });

  module('when there is already an issue report', function() {
    module.only('when the issue report is of type OTHER', function() {
      test('it should show textearea already filled', async function(assert) {
        // given
        const certificationCourseId = 1;
        const certificationIssueReport = EmberObject.create({
          certificationCourseId,
          categoryId: OTHER,
          description: 'coucou',
        });
        const report = EmberObject.create({
          certificationCourseId,
          firstName: 'Lisa',
          lastName: 'Monpud',
          certificationIssueReports : [ certificationIssueReport ],
          hasSeenEndTestScreen: false,
        });

        const closeExaminerReportModalStub = sinon.stub();
        this.set('closeExaminerReportModal', closeExaminerReportModalStub);
        this.set('reportToEdit', report);
        this.set('maxlength', 500);

        // when
        await render(hbs`
          <ExaminerReportModal
            @closeModal={{this.closeExaminerReportModal}}
            @report={{this.reportToEdit}}
            @maxlength={{@examinerCommentMaxLength}}
          />
        `);

        // then
        assert.dom(TEXT_AREA_OF_TYPE_OTHER_SELECTOR).exists();
        assert.dom(REPORT_INPUT_LENGTH_INDICATOR).hasText(`${certificationIssueReport.description.length} / 500`);
      });
    });
  });

  module('when there is no issue report yet', function() {
    module('when radio button "Autre incident" is not checked', function() {
  
      test('it should only show "Autre incident" label', async function(assert) {
        // given
        const report = EmberObject.create({
          certificationCourseId: 1,
          firstName: 'Lisa',
          lastName: 'Monpud',
          examinerComment: null,
          hasSeenEndTestScreen: false,
        });
        const closeExaminerReportModalStub = sinon.stub();
        this.set('closeExaminerReportModal', closeExaminerReportModalStub);
        this.set('reportToEdit', report);
        this.set('maxlength', 500);
  
        // when
        await render(hbs`
          <ExaminerReportModal
            @closeModal={{this.closeExaminerReportModal}}
            @report={{this.reportToEdit}}
            @maxlength={{@examinerCommentMaxLength}}
          />
        `);
        
        // then
        assert.dom(TEXT_AREA_OF_TYPE_OTHER_SELECTOR).doesNotExist();
        assert.dom(LABEL_FOR_RADIO_BUTTON_OF_TYPE_OTHER_SELECTOR).hasText('Autre incident');
      });
    });
  });
});
