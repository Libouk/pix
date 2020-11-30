import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { OTHER, LATE_OR_LEAVING } from 'pix-certif/models/certification-issue-report';

export default class ExaminerReportModal extends Component {
  @service store

  reportOfTypeOther = this.args.report.examinerComment;

  constructor() {
    super(...arguments);
    this.currentIssueReport = this.store.createRecord('certification-issue-report', { certificationCourseId: this.args.report.certificationCourseId });
  }

  @tracked
  isReportOfTypeOtherChecked = false;

  @tracked
  isReportOfTypeLateOrLeavingChecked = false;

  @tracked
  reportLength = 0

  @action
  toggleShowReportOfTypeOther() {
    this.isReportOfTypeOtherChecked = !this.isReportOfTypeOtherChecked;
    if (this.isReportOfTypeOtherChecked) {
      this.currentIssueReport.categoryId = OTHER;
      this.isReportOfTypeLateOrLeavingChecked = false;
    }
    if (this.args.report.examinerComment) {
      this.reportLength = this.args.report.examinerComment.length;
    }
  }

  @action
  toggleShowReportOfTypeLateOrLeaving() {
    this.isReportOfTypeLateOrLeavingChecked = !this.isReportOfTypeLateOrLeavingChecked;
    if (this.isReportOfTypeOtherChecked) {
      this.currentIssueReport.categoryId = LATE_OR_LEAVING;
      this.isReportOfTypeOtherChecked = false;
    }
    if (this.args.report.examinerComment) {
      this.reportLength = this.args.report.examinerComment.length;
    }
  }

  @action
  submitReport() {
    this.args.report.certificationIssueReports.push(this.currentIssueReport);
    this.args.closeModal();
  }

  @action
  handleTextareaChange(e) {
    this.reportLength = e.target.value.length;
  }
}
