const faker = require('faker');
const moment = require('moment');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const buildAssessment = require('./build-assessment');

module.exports = function buildCertificationCourse(
  {
    id = faker.random.number(),
    // attributes
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    birthplace = faker.address.city(),
    birthdate = moment(faker.date.past(25)).format('YYYY-MM-DD'),
    createdAt = faker.date.past(1),
    completedAt = faker.date.recent(),
    externalId = faker.random.uuid(),
    examinerComment = faker.lorem.sentence(),
    hasSeenEndTestScreen = false,
    nbChallenges = faker.random.number(40),
    isV2Certification = false,
    isPublished = faker.random.boolean(),
    verificationCode = `P-${faker.random.alphaNumeric(8).toUpperCase()}`,
    // includes
    acquiredPartnerCertifications = [],
    assessment = buildAssessment({ certificationCourseId: this.id }),
    challenges = [],
    // references
    userId = faker.random.number(),
    sessionId = faker.random.number(),
  } = {}) {

  const certificationCourse = new CertificationCourse({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    createdAt,
    completedAt,
    externalId,
    examinerComment,
    hasSeenEndTestScreen,
    nbChallenges,
    isV2Certification,
    isPublished,
    verificationCode,
    acquiredPartnerCertifications,
    assessment,
    challenges,
    sessionId,
    userId,
  });

  return certificationCourse;
};
