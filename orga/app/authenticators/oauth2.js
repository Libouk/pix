import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'pix-orga/config/environment';

export default OAuth2PasswordGrant.extend({
  serverTokenEndpoint: `${ENV.APP.API_HOST}/token`,
  serverTokenRevocationEndpoint: `${ENV.APP.API_HOST}/revoke`,
});
