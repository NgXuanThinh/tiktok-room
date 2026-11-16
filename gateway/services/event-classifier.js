// gateway/services/event-classifier.js - Event Priority Classifier
import { PRIORITY_TIERS, COMMAND_CONFIG } from '../constants/gateway.constants.js';

export class EventClassifier {
  /**
   * Evaluates the priority category of an incoming normalized event.
   * @param {object} event - Normalized TikTok event
   * @returns {string} One of PRIORITY_TIERS keys
   */
  static classify(event) {
    if (!event) return 'UNKNOWN';

    // 1. VIP Gift (Tier 2/3/4 or coins >= 100) -> P0 (Never Drop, Immediate Bypass)
    if (event.type === 'gift') {
      const tier = Number(event.data?.tier || 1);
      const totalCoins = Number(event.data?.totalCoins || event.data?.diamondCount || 0);
      if (tier >= PRIORITY_TIERS.VIP_MIN_TIER || totalCoins >= PRIORITY_TIERS.VIP_COIN_THRESHOLD) {
        return PRIORITY_TIERS.P0_VIP_GIFT;
      }
      return 'NORMAL_GIFT';
    }

    // 2. Likes -> P1 (Like Combo Aggregator)
    if (event.type === 'like') {
      return PRIORITY_TIERS.P1_LIKE_COMBO;
    }

    // 3. Interactive Chat Commands (!color, !face, !dance) -> P2 (Unified Command Throttler)
    if (event.type === 'chat') {
      const comment = (event.data?.comment || '').trim();
      if (comment.startsWith('!')) {
        const cmd = comment.split(/\s+/)[0].toLowerCase();
        if (COMMAND_CONFIG.SUPPORTED.includes(cmd)) {
          return PRIORITY_TIERS.P2_CHAT_COMMAND;
        }
      }
      return 'NORMAL_CHAT';
    }

    // 4. Social & System Events (Follow, Share, Member, Room Ranks)
    return 'SOCIAL_EVENT';
  }
}
