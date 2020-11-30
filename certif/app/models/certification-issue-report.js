import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export const OTHER = 1;
export const CANDIDATE_INFORMATIONS_CHANGES = 2;
export const LATE_OR_LEAVING = 3;
export const CONNEXION_OR_END_SCREEN = 4;

export const certificationIssueReportCategoriesLabel = {
  [OTHER]: 'Autre incident',
  [CANDIDATE_INFORMATIONS_CHANGES]: 'Modification infos candidat',
  [LATE_OR_LEAVING]: 'Retard, absence ou départ',
  [CONNEXION_OR_END_SCREEN]: 'Connexion et fin de test',
};

export default class CertificationIssueReport extends Model {
  @attr('number') certificationCourseId;
  @attr('number') categoryId;
  @attr('string') description;

  @computed('categoryId')
  get displayCategory() {
    return certificationIssueReportCategoriesLabel[this.categoryId];
  }
}
