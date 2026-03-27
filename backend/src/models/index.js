import { User } from './User.js';
import { Episode } from './Episode.js';
import { UserGamification } from './UserGamification.js';
import { UserEpisodeProgress } from './UserEpisodeProgress.js';
import { GamificationEvent } from './GamificationEvent.js';
import { UserMissionClaim } from './UserMissionClaim.js';
import { UserRewardRedemption } from './UserRewardRedemption.js';
import { EpisodeAttempt } from './EpisodeAttempt.js';
import { UserEpisodeAttemptCredit } from './UserEpisodeAttemptCredit.js';
import { CollectibleItem } from './CollectibleItem.js';
import { LimitedEvent } from './LimitedEvent.js';
import { UserCollectible } from './UserCollectible.js';
import { UserLimitedEventClaim } from './UserLimitedEventClaim.js';
import { CommunityTopic } from './CommunityTopic.js';
import { CommunityReply } from './CommunityReply.js';
import { CommunityVote } from './CommunityVote.js';
import { CommunityReport } from './CommunityReport.js';
import { CommunityModerationLog } from './CommunityModerationLog.js';
import { UserSession } from './UserSession.js';

User.hasOne(UserGamification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserGamification.belongsTo(User, { foreignKey: 'user_id' });

User.belongsToMany(Episode, {
    through: UserEpisodeProgress,
    foreignKey: 'user_id',
    otherKey: 'episode_id'
});
Episode.belongsToMany(User, {
    through: UserEpisodeProgress,
    foreignKey: 'episode_id',
    otherKey: 'user_id'
});

UserEpisodeProgress.belongsTo(User, { foreignKey: 'user_id' });
UserEpisodeProgress.belongsTo(Episode, { foreignKey: 'episode_id' });

UserEpisodeAttemptCredit.belongsTo(User, { foreignKey: 'user_id' });
UserEpisodeAttemptCredit.belongsTo(Episode, { foreignKey: 'episode_id' });
User.hasMany(UserEpisodeAttemptCredit, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Episode.hasMany(UserEpisodeAttemptCredit, { foreignKey: 'episode_id', onDelete: 'CASCADE' });

LimitedEvent.belongsTo(Episode, { foreignKey: 'episode_id' });
LimitedEvent.belongsTo(CollectibleItem, { foreignKey: 'reward_item_id', as: 'rewardItem' });

UserLimitedEventClaim.belongsTo(User, { foreignKey: 'user_id' });
UserLimitedEventClaim.belongsTo(LimitedEvent, { foreignKey: 'event_id' });
User.hasMany(UserLimitedEventClaim, { foreignKey: 'user_id', onDelete: 'CASCADE' });
LimitedEvent.hasMany(UserLimitedEventClaim, { foreignKey: 'event_id', onDelete: 'CASCADE' });

UserCollectible.belongsTo(User, { foreignKey: 'user_id' });
UserCollectible.belongsTo(CollectibleItem, { foreignKey: 'item_id' });
UserCollectible.belongsTo(LimitedEvent, { foreignKey: 'source_event_id' });
User.hasMany(UserCollectible, { foreignKey: 'user_id', onDelete: 'CASCADE' });
CollectibleItem.hasMany(UserCollectible, { foreignKey: 'item_id', onDelete: 'CASCADE' });
LimitedEvent.hasMany(UserCollectible, { foreignKey: 'source_event_id', onDelete: 'SET NULL' });
User.hasMany(EpisodeAttempt, { foreignKey: 'user_id', onDelete: 'CASCADE' });
EpisodeAttempt.belongsTo(User, { foreignKey: 'user_id' });
Episode.hasMany(EpisodeAttempt, { foreignKey: 'episode_id', onDelete: 'CASCADE' });
EpisodeAttempt.belongsTo(Episode, { foreignKey: 'episode_id' });

User.hasMany(GamificationEvent, { foreignKey: 'user_id', onDelete: 'CASCADE' });
GamificationEvent.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserMissionClaim, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserMissionClaim.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserRewardRedemption, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserRewardRedemption.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(UserSession, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CommunityTopic, { foreignKey: 'author_user_id', onDelete: 'CASCADE' });
CommunityTopic.belongsTo(User, { foreignKey: 'author_user_id', as: 'author' });
CommunityTopic.hasMany(CommunityReply, { foreignKey: 'topic_id', as: 'replies', onDelete: 'CASCADE' });
CommunityReply.belongsTo(CommunityTopic, { foreignKey: 'topic_id' });
User.hasMany(CommunityReply, { foreignKey: 'author_user_id', onDelete: 'CASCADE' });
CommunityReply.belongsTo(User, { foreignKey: 'author_user_id', as: 'author' });

CommunityReply.hasMany(CommunityVote, { foreignKey: 'reply_id', as: 'votes', onDelete: 'CASCADE' });
CommunityVote.belongsTo(CommunityReply, { foreignKey: 'reply_id' });
User.hasMany(CommunityVote, { foreignKey: 'user_id', onDelete: 'CASCADE' });
CommunityVote.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CommunityReport, { foreignKey: 'reporter_user_id', onDelete: 'CASCADE' });
CommunityReport.belongsTo(User, { foreignKey: 'reporter_user_id', as: 'reporter' });
User.hasMany(CommunityModerationLog, { foreignKey: 'moderator_user_id', onDelete: 'CASCADE' });
CommunityModerationLog.belongsTo(User, { foreignKey: 'moderator_user_id', as: 'moderator' });

export {
    User,
    Episode,
    UserGamification,
    UserEpisodeProgress,
    UserEpisodeAttemptCredit,
    CollectibleItem,
    LimitedEvent,
    UserCollectible,
    UserLimitedEventClaim,
    EpisodeAttempt,
    GamificationEvent,
    UserMissionClaim,
    UserRewardRedemption,
    UserSession,
    CommunityTopic,
    CommunityReply,
    CommunityVote,
    CommunityReport,
    CommunityModerationLog
};
