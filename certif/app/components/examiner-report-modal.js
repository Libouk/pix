import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { OTHER, LATE_OR_LEAVING } from 'pix-certif/models/certification-issue-report';

export default class ExaminerReportModal extends Component {
  @service store

  @tracked isReportOfTypeOtherChecked = false;
  @tracked isReportOfTypeLateOrLeavingChecked = false;
  @tracked reportLength = 0

  constructor() {
    super(...arguments);
    const certificationIssueReports = this.args.report.certificationIssueReports;
    if (certificationIssueReports && certificationIssueReports.length) {
      this.currentIssueReport = certificationIssueReports[0];
      // todo : selon la catégorie il faut checker le bon radio button
    } else {
      this.currentIssueReport = this.store.createRecord('certification-issue-report', { certificationCourseId: this.args.report.certificationCourseId });
    }
  }

  @action
  toggleShowReportOfTypeOther() {
    this.isReportOfTypeOtherChecked = !this.isReportOfTypeOtherChecked;
    this.currentIssueReport.description = null;
    this.reportLength = 0;
    if (this.isReportOfTypeOtherChecked) {
      this.isReportOfTypeLateOrLeavingChecked = false;
      this.currentIssueReport.categoryId = OTHER;
    }
  }

  @action
  toggleShowReportOfTypeLateOrLeaving() {
    this.isReportOfTypeLateOrLeavingChecked = !this.isReportOfTypeLateOrLeavingChecked;
    this.currentIssueReport.description = null;
    this.reportLength = 0;
    if (this.isReportOfTypeLateOrLeavingChecked) {
      this.isReportOfTypeOtherChecked = false;
      this.currentIssueReport.categoryId = LATE_OR_LEAVING;
    }
  }

  @action
  submitReport() {
    this.args.report.certificationIssueReports.push(this.currentIssueReport); // .push ???
    this.args.closeModal();
  }

  @action
  handleTextareaChange(e) {
    this.reportLength = e.target.value.length;
  }
}
