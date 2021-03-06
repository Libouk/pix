const { expect } = require('../../../test-helper');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | AuthenticationMethod', () => {

  describe('constructor', () => {

    it('should successfully instantiate object when identityProvider is GAR and externalIdentifier is defined', () => {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: 'externalIdentifier', userId: 1 }))
        .not.to.throw(ObjectValidationError);
    });

    it('should successfully instantiate object when identityProvider is POLE_EMPLOI and externalIdentifier is defined', () => {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI, externalIdentifier: 'externalIdentifier', userId: 1 }))
        .not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when identityProvider is not valid', () => {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: 'not_valid', externalIdentifier: 'externalIdentifier', userId: 1 }))
        .to.throw(ObjectValidationError);
      expect(() => new AuthenticationMethod({ identityProvider: undefined, externalIdentifier: 'externalIdentifier', userId: 1 }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when externalIdentifier is not defined for identityProvider GAR or POLE_EMPLOI', () => {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: undefined, userId: 1 }))
        .to.throw(ObjectValidationError);
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI, externalIdentifier: undefined, userId: 1 }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when authenticationComplement is not defined for identityProvider PIX', () => {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.PIX, authenticationComplement: undefined, userId: 1 }))
        .to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when userId is not valid', () => {
      // when
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: 'externalIdentifier', userId: 'not_valid' }))
        .to.throw(ObjectValidationError);
      expect(() => new AuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: 'externalIdentifier', userId: undefined }))
        .to.throw(ObjectValidationError);
    });

    context('PasswordAuthenticationMethod', () => {

      let validArguments;
      beforeEach(() => {
        validArguments = {
          password: 'Password123',
          shouldChangePassword: false,
        };
      });

      it('should successfully instantiate object when passing all valid arguments', () => {
        // when
        expect(() => new AuthenticationMethod.PasswordAuthenticationMethod(validArguments)).not.to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when password is not valid', () => {
        // when
        expect(() => new AuthenticationMethod.PasswordAuthenticationMethod({ ...validArguments, password: 1234 }))
          .to.throw(ObjectValidationError);
        expect(() => new AuthenticationMethod.PasswordAuthenticationMethod({ ...validArguments, password: undefined }))
          .to.throw(ObjectValidationError);
      });

      it('should throw an ObjectValidationError when shouldChangePassword is not valid', () => {
        // when
        expect(() => new AuthenticationMethod.PasswordAuthenticationMethod({ ...validArguments, shouldChangePassword: 'not_valid' }))
          .to.throw(ObjectValidationError);
        expect(() => new AuthenticationMethod.PasswordAuthenticationMethod({ ...validArguments, shouldChangePassword: undefined }))
          .to.throw(ObjectValidationError);
      });
    });
  });
});
