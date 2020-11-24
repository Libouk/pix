const { expect, nock, catchErr } = require('../../test-helper');

const lcms = require('../../../lib/infrastructure/lcms');

describe('Unit | Infrastructure | LCMS', () => {
  describe('#getLatestRelease', () => {

    it('calls LCMS API to get learning content release', async () => {
      // given
      const lcmsCall = nock('https://lcms-test.pix.fr/api')
        .get('/releases/latest')
        .matchHeader('Authorization', 'Basic test-api-key')
        .reply(200);

      // when
      await lcms.getLatestRelease();

      // then
      expect(lcmsCall.isDone()).to.equal(true);
    });

    it('returns learning content release', async () => {
      // given
      const learningContent = { models: [{ id: 'recId' }] };
      nock('https://lcms-test.pix.fr/api')
        .get('/releases/latest')
        .matchHeader('Authorization', 'Basic test-api-key')
        .reply(200, learningContent);

      // when
      const response = await lcms.getLatestRelease();

      // then
      expect(response).to.deep.equal(learningContent);
    });

    it('rejects when learning content release failed to get', async () => {
      // given
      nock('https://lcms-test.pix.fr/api')
        .get('/releases/latest')
        .matchHeader('Authorization', 'Basic test-api-key')
        .reply(500);

      // when
      const error = await catchErr(lcms.getLatestRelease)();

      // then
      expect(error).to.be.not.null;
    });

  });
});