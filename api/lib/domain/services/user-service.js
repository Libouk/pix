const DomainTransaction = require('../../infrastructure/DomainTransaction');

const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');

function _buildPasswordAuthenticationMethod({
  userId,
  hashedPassword,
}) {
  return new AuthenticationMethod({
    userId,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PasswordAuthenticationMethod({
      password: hashedPassword,
      shouldChangePassword: false,
    }),
  });
}

function _buildGARAuthenticationMethod({
  externalIdentifier,
  userId,
}) {
  return new AuthenticationMethod({
    externalIdentifier,
    identityProvider: AuthenticationMethod.identityProviders.GAR,
    userId,
    authenticationComplement: null,
  });
}

async function createUserWithPassword({
  user,
  hashedPassword,
  userRepository,
  authenticationMethodRepository,
}) {
  let savedUser;
  let savedAuthenticationMethod;

  await DomainTransaction.execute(async (domainTransaction) => {
    savedUser = await userRepository.create({ user, domainTransaction });

    const authenticationMethod = _buildPasswordAuthenticationMethod({
      userId: savedUser.id,
      hashedPassword,
    });

    savedAuthenticationMethod = await authenticationMethodRepository.create({
      authenticationMethod,
      domainTransaction,
    });
  });

  return {
    savedUser,
    savedAuthenticationMethod,
  };
}

async function updateUsernameAndPassword({
  userId,
  username,
  hashedPassword,
  authenticationMethodRepository,
  userRepository,
}) {
  return DomainTransaction.execute(async (domainTransaction) => {
    await userRepository.updateUsername({ userId, username, domainTransaction });
    return authenticationMethodRepository.updatePasswordThatShouldBeChanged({
      userId,
      hashedPassword,
      domainTransaction,
    });
  });
}

async function createAndReconcileUserToSchoolingRegistration({
  samlId,
  schoolingRegistrationId,
  user,
  authenticationMethodRepository,
  schoolingRegistrationRepository,
  userRepository,
}) {
  return DomainTransaction.execute(async (domainTransaction) => {
    const createdUser = await userRepository.create({
      user,
      domainTransaction,
    });

    if (samlId) {
      const authenticationMethod = _buildGARAuthenticationMethod({
        externalIdentifier: samlId,
        userId: createdUser.id,
      });

      await authenticationMethodRepository.create({
        authenticationMethod,
        domainTransaction,
      });
    }

    await schoolingRegistrationRepository.updateUserIdWhereNull({
      schoolingRegistrationId,
      userId: createdUser.id,
      domainTransaction,
    });

    return createdUser.id;
  });
}

module.exports = {
  createAndReconcileUserToSchoolingRegistration,
  createUserWithPassword,
  updateUsernameAndPassword,
};
