const BookshelfAuthenticationMethod = require('../../infrastructure/data/authentication-method');
const bookshelfUtils = require('../utils/knex-utils');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const DomainTransaction = require('../DomainTransaction');
const { AlreadyExistingEntity, NotFoundError } = require('../../domain/errors');

function _toDomainEntity(bookshelfAuthenticationMethod) {
  const attributes = bookshelfAuthenticationMethod.toJSON();
  return new AuthenticationMethod({
    id: attributes.id,
    userId: attributes.userId,
    identityProvider: attributes.identityProvider,
    authenticationComplement: attributes.identityProvider === AuthenticationMethod.identityProviders.PIX ? new AuthenticationMethod.PasswordAuthenticationMethod(attributes.authenticationComplement) : undefined,
    externalIdentifier: (attributes.identityProvider === AuthenticationMethod.identityProviders.GAR || attributes.identityProvider === AuthenticationMethod.identityProviders.POLE_EMPLOI) ? attributes.externalIdentifier : undefined,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  });
}
module.exports = {

  async create({ authenticationMethod, domainTransaction = DomainTransaction.emptyTransaction() }) {
    try {
      const bookshelfAuthenticationMethod = await new BookshelfAuthenticationMethod(authenticationMethod)
        .save(null, { transacting: domainTransaction.knexTransaction });
      return _toDomainEntity(bookshelfAuthenticationMethod);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntity(`A snapshot already exists for the user ${authenticationMethod.userId} and the externalIdentifier ${authenticationMethod.externalIdentifier}.`);
      }
    }
  },

  async findOneByUserIdAndIdentityProvider({ userId, identityProvider }) {
    const authenticationMethod = await BookshelfAuthenticationMethod
      .where({ userId, identityProvider })
      .fetch({ require: false });

    return authenticationMethod ? _toDomainEntity(authenticationMethod) : null;
  },

  async findOneByExternalIdentifierAndIdentityProvider({ externalIdentifier, identityProvider }) {
    const authenticationMethod = await BookshelfAuthenticationMethod
      .where({ externalIdentifier, identityProvider })
      .fetch({ require: false });

    return authenticationMethod ? _toDomainEntity(authenticationMethod) : null;
  },

  async updateExternalIdentifierByUserIdAndIdentityProvider({ externalIdentifier, userId, identityProvider }) {
    try {
      const bookshelfAuthenticationMethod = await BookshelfAuthenticationMethod
        .where({ userId, identityProvider })
        .save({ externalIdentifier }, { method: 'update', patch: true, require: true });
      return _toDomainEntity(bookshelfAuthenticationMethod);
    } catch (err) {
      if (err instanceof BookshelfAuthenticationMethod.NoRowsUpdatedError) {
        throw new NotFoundError(`No rows updated for authentication method of type ${identityProvider} for user ${userId}.`);
      }
      throw err;
    }
  },

};
