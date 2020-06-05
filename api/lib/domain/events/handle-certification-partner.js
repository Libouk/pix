const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('../models/CertificationPartnerAcquisition');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const { checkEventType } = require('./check-event-type');

const eventType = CertificationScoringCompleted;

async function handleCertificationAcquisitionForPartner({
  domainTransaction,
  event,
  badgeAcquisitionRepository,
  competenceRepository,
  competenceMarkRepository,
  certificationPartnerAcquisitionRepository,
}) {
  checkEventType(event, eventType);

  const certificationCourseId = event.certificationCourseId;
  const cleaPartnerAcquisition = new CertificationPartnerAcquisition({
    certificationCourseId,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
  });

  const hasAcquiredBadgeClea = await _getHasAcquiredBadgeClea(badgeAcquisitionRepository, event.userId);
  const competenceMarks = await competenceMarkRepository.getLatestByCertificationCourseId({ certificationCourseId, domainTransaction });
  const totalPixCleaByCompetence = await competenceRepository.getTotalPixCleaByCompetence();

  if (cleaPartnerAcquisition.hasAcquiredCertification({
    hasAcquiredBadge: hasAcquiredBadgeClea,
    reproducibilityRate: event.reproducibilityRate,
    totalPixCleaByCompetence,
    competenceMarks
  })) {
    await certificationPartnerAcquisitionRepository.save(cleaPartnerAcquisition, domainTransaction);
  }
}

async function _getHasAcquiredBadgeClea(badgeAcquisitionRepository, userId) {
  return badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
    badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
    userId,
  });
}

handleCertificationAcquisitionForPartner.eventType = eventType;
module.exports = handleCertificationAcquisitionForPartner;
