const securityController = require('../../interfaces/controllers/security-controller');
const certificationCourseController = require('./certification-course-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}/details',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: certificationCourseController.computeResult,
        tags: ['api'],
        notes: [
          'Cette route est utilisé par Pix Admin',
          'Elle sert au cas où une certification a eu une erreur de calcul',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: certificationCourseController.getResult,
        tags: ['api']
      }
    },
    {
      method: 'PATCH',
      path: '/api/certification-courses/{id}',
      config: {
        handler: certificationCourseController.update,
        tags: ['api']
      }
    }

  ]);

  return next();
};

exports.register.attributes = {
  name: 'certification-courses-api',
  version: '1.0.0'
};
