export const COMMUNITY_EVENT_TYPES = {
    TOPIC_CREATED: 'community_topic_created',
    REPLY_CREATED: 'community_reply_created',
    REPLY_UPVOTED: 'community_reply_upvoted',
    BEST_REPLY_SELECTED: 'community_best_reply_selected'
};

export const COMMUNITY_EVENT_TYPE_LIST = Object.freeze([
    COMMUNITY_EVENT_TYPES.TOPIC_CREATED,
    COMMUNITY_EVENT_TYPES.REPLY_CREATED,
    COMMUNITY_EVENT_TYPES.REPLY_UPVOTED,
    COMMUNITY_EVENT_TYPES.BEST_REPLY_SELECTED
]);
