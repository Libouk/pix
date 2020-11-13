const { batch } = require('../batchTreatment');

const AuthenticationMethod = require('../../lib/domain/models/AuthenticationMethod');

const TABLE_USERS = 'users';
const PASSWORD_COLUMN = 'password';
const SHOULD_CHANGE_PASSWORD_COLUMN = 'shouldChangePassword';

const TABLE_AUTHENTICATION_METHODS = 'authentication-methods';

exports.up = async (knex) => {
  const sqlRequest = `SELECT "id", "${PASSWORD_COLUMN}", "${SHOULD_CHANGE_PASSWORD_COLUMN}" ` +
                     `FROM "${TABLE_USERS}" ` +
                     `WHERE ("${PASSWORD_COLUMN}" = '') IS FALSE`;

  const usersWithPasswordInformations = await knex.raw(sqlRequest);

  return batch(knex, usersWithPasswordInformations.rows, (user) => {
    return knex(TABLE_AUTHENTICATION_METHODS)
      .insert({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
        authenticationComplement: new AuthenticationMethod.PasswordAuthenticationMethod({
          password: user[PASSWORD_COLUMN],
          shouldChangePassword: user[SHOULD_CHANGE_PASSWORD_COLUMN],
        }),
      });
  });
};

exports.down = async (knex) => {
  const pixAuthenticationMethods = await knex(TABLE_AUTHENTICATION_METHODS)
    .select('userId', 'authenticationComplement')
    .where({ identityProvider: AuthenticationMethod.identityProviders.PIX });

  await batch(knex, pixAuthenticationMethods, (authenticationMethod) => {
    return knex(TABLE_USERS)
      .where({ id: authenticationMethod.userId })
      .update({
        password: authenticationMethod.authenticationComplement.password,
        shouldChangePassword: authenticationMethod.authenticationComplement.shouldChangePassword,
      });
  });

  return knex(TABLE_AUTHENTICATION_METHODS)
    .where({ identityProvider: AuthenticationMethod.identityProviders.PIX })
    .delete();
};
