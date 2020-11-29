const {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  knex,
} = require('../../../test-helper');

const {
  AlreadyExistingEntityError,
  AuthenticationMethodNotFoundError,
} = require('../../../../lib/domain/errors');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');

describe('Integration | Repository | AuthenticationMethod', () => {

  const hashedPassword = 'ABCDEF1234';
  const newHashedPassword = '1234ABCDEF';

  describe('#create', () => {

    afterEach(() => {
      return knex('authentication-methods').delete();
    });

    context('When creating a AuthenticationMethod containing an external identifier', () => {

      it('should return an AuthenticationMethod', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'externalIdentifier',
          userId,
        });

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        // then
        expect(savedAuthenticationMethod).to.be.instanceOf(AuthenticationMethod);
      });
    });

    context('When an AuthenticationMethod already exist for an identity provider and an external identifier', () => {

      it('should throw an AlreadyExistingEntityError', async () => {
        // given
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const externalIdentifier = 'alreadyExistingExternalIdentifier';
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAuthenticationMethod({
          identityProvider,
          externalIdentifier,
          userId: databaseBuilder.factory.buildUser().id,
        });
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({ identityProvider, externalIdentifier, userId });

        // when
        const error = await catchErr(authenticationMethodRepository.create)({ authenticationMethod });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });

    context('When an AuthenticationMethod already exist for an identity provider and a userId', () => {

      it('should throw an AlreadyExistingEntityError', async () => {
        // given
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAuthenticationMethod({ identityProvider, externalIdentifier: 'externalIdentifier1', userId });
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({ identityProvider, externalIdentifier: 'externalIdentifier2', userId });

        // when
        const error = await catchErr(authenticationMethodRepository.create)({ authenticationMethod });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });
  });

  describe('#updateOnlyPassword', () => {

    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should update the password', async () => {
      // given
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
      });
      await databaseBuilder.commit();

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateOnlyPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod).to.be.an.instanceOf(AuthenticationMethod);
      expect(updatedAuthenticationMethod.authenticationComplement).to.be.an.instanceOf(AuthenticationMethod.PasswordAuthenticationMethod);
      expect(updatedAuthenticationMethod.authenticationComplement.password).to.equal(newHashedPassword);
    });

    it('should update only the password', async () => {
      // given
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
        shouldChangePassword: true,
      });
      await databaseBuilder.commit();

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateOnlyPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod.authenticationComplement.password).to.equal(newHashedPassword);
      expect(updatedAuthenticationMethod.authenticationComplement.shouldChangePassword).to.be.true;
    });

    it('should throw AuthenticationMethodNotFoundError when user id not found', async () => {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updateOnlyPassword)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });
  });

  describe('#findOneByUserIdAndIdentityProvider', () => {

    it('should return the AuthenticationMethod associated to a user for a given identity provider', async () => {
      // given
      const identityProvider = AuthenticationMethod.identityProviders.GAR;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.buildPasswordAuthenticationMethod({ userId });
      const garAuthenticationMethodInDB = databaseBuilder.factory.buildAuthenticationMethod({ identityProvider, userId });
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByUserIdAndIdentityProvider = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId, identityProvider });

      // then
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.be.instanceof(AuthenticationMethod);
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.deep.equal(garAuthenticationMethodInDB);
    });

    it('should return null if there is no AuthenticationMethod for the given user and identity provider', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      const identityProvider = AuthenticationMethod.identityProviders.GAR;

      // when
      const authenticationMethodsByUserIdAndIdentityProvider = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId, identityProvider });

      // then
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.be.null;
    });
  });

  describe('#findOneByExternalIdentifierAndIdentityProvider', () => {

    it('should return the AuthenticationMethod for a given external identifier and identity provider', async () => {
      // given
      const identityProvider = AuthenticationMethod.identityProviders.GAR;
      const externalIdentifier = 'samlId';
      const authenticationMethodInDB = databaseBuilder.factory.buildAuthenticationMethod({ externalIdentifier, identityProvider });
      databaseBuilder.factory.buildAuthenticationMethod({ externalIdentifier: 'another_sub', identityProvider });
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByTypeAndValue = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({ externalIdentifier, identityProvider });

      // then
      expect(authenticationMethodsByTypeAndValue).to.be.instanceof(AuthenticationMethod);
      expect(authenticationMethodsByTypeAndValue).to.deep.equal(authenticationMethodInDB);
    });

    it('should return null if there is no AuthenticationMethods for the given external identifier and identity provider', async () => {
      // given
      const identityProvider = AuthenticationMethod.identityProviders.GAR;
      const externalIdentifier = 'samlId';

      // when
      const authenticationMethodsByTypeAndValue = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({ externalIdentifier, identityProvider });

      // then
      expect(authenticationMethodsByTypeAndValue).to.be.null;
    });
  });

  describe('#updateExternalIdentifierByUserIdAndIdentityProvider', () => {

    context('When authentication method exists', async () => {

      let authenticationMethod;

      beforeEach(() => {
        const userId = databaseBuilder.factory.buildUser().id;
        authenticationMethod = databaseBuilder.factory.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'to_be_updated',
          userId,
        });
        return databaseBuilder.commit();
      });

      it('should update external identifier by userId and identity provider', async () => {
        // given
        const userId = authenticationMethod.userId;
        const identityProvider = authenticationMethod.identityProvider;
        const externalIdentifier = 'new_saml_id';

        // when
        const updatedAuthenticationMethod = await authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider({ externalIdentifier, userId, identityProvider });

        // then
        expect(updatedAuthenticationMethod.externalIdentifier).to.equal(externalIdentifier);
      });
    });

    context('When authentication method does not exist', async () => {

      it('should throw an AuthenticationMethod not found error', async () => {
        // given
        const userId = 12345;
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const externalIdentifier = 'new_saml_id';

        // when
        const error = await catchErr(authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider)({ externalIdentifier, userId, identityProvider });

        // then
        expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      });
    });
  });

  describe('#updatePasswordThatShouldBeChanged', () => {

    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
        shouldChangePassword: false,
      });
      await databaseBuilder.commit();
    });

    it('should update password and set shouldChangePassword to true', async () => {
      // given
      const expectedAuthenticationComplement = new AuthenticationMethod.PasswordAuthenticationMethod({
        password: newHashedPassword,
        shouldChangePassword: true,
      });

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updatePasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod).to.be.an.instanceOf(AuthenticationMethod);
      expect(updatedAuthenticationMethod.authenticationComplement).to.be.an.instanceOf(AuthenticationMethod.PasswordAuthenticationMethod);
      expect(updatedAuthenticationMethod.authenticationComplement).to.deep.equal(expectedAuthenticationComplement);
    });

    it('should throw AuthenticationMethodNotFoundError when user id not found', async () => {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updatePasswordThatShouldBeChanged)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });
  });

  describe('#updateExpiredPassword', () => {

    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({ shouldChangePassword: true }).id;
      databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
        userId,
        hashedPassword,
        shouldChangePassword: true,
      });
      await databaseBuilder.commit();
    });

    it('should update password and set shouldChangePassword to false', async () => {
      // given
      const expectedAuthenticationComplement = new AuthenticationMethod.PasswordAuthenticationMethod({
        password: newHashedPassword,
        shouldChangePassword: false,
      });

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateExpiredPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod).to.be.an.instanceOf(AuthenticationMethod);
      expect(updatedAuthenticationMethod.authenticationComplement).to.be.an.instanceOf(AuthenticationMethod.PasswordAuthenticationMethod);
      expect(updatedAuthenticationMethod.authenticationComplement).to.deep.equal(expectedAuthenticationComplement);
    });

    it('should throw AuthenticationMethodNotFoundError when user id is not found', async () => {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updateExpiredPassword)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });
  });

});
