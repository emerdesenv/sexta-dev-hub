import { User } from './User.js';
import { Episode } from './Episode.js';
import { UserGamification } from './UserGamification.js';
import { UserEpisodeProgress } from './UserEpisodeProgress.js';
import { GamificationEvent } from './GamificationEvent.js';
import { UserMissionClaim } from './UserMissionClaim.js';
import { UserRewardRedemption } from './UserRewardRedemption.js';
import { EpisodeAttempt } from './EpisodeAttempt.js';
import { UserEpisodeAttemptCredit } from './UserEpisodeAttemptCredit.js';

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

export {
    User,
    Episode,
    UserGamification,
    UserEpisodeProgress,
    UserEpisodeAttemptCredit,
    EpisodeAttempt,
    GamificationEvent,
    UserMissionClaim,
    UserRewardRedemption
};
