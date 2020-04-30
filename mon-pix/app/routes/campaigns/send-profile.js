import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CampaignsSendProfileRoute extends Route {
  @service currentUser;
  @service store;

  async model(params) {
    const user = this.currentUser.user;

    const campaigns = await this.store.query('campaign', { filter: { code: params.campaign_code } });
    const campaign = campaigns.get('firstObject');
    return RSVP.hash({
      campaign,
      campaignParticipation: this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId: user.id }),
      user
    });
  }

  async afterModel({ campaign, campaignParticipation, user }) {
    if (!campaignParticipation) {
      return this.replaceWith('campaigns.start-or-resume', campaign.code);
    }
    await user.hasMany('scorecards').reload();
    await user.belongsTo('pixScore').reload();
  }
}
