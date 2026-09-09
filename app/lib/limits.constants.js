// Pure constants only — safe to import from client components. Server-side logic that
// needs DB access lives in app/lib/limits.js instead.

// Default per-workspace daily action caps, matching the values already shown
// in the Settings > Limits & Activity control sliders.
export const DEFAULT_DAILY_LIMITS = {
  connectionRequests: 5,
  messages: 5,
  inmails: 5,
  profileViews: 5,
  endorsements: 5,
  likes: 5,
  followings: 5,
  emails: 20,
  activityControlOn: true,
  range: "3",
};

// Upper bounds for each slider (not workspace-configurable, just UI range).
export const DAILY_LIMIT_MAX = {
  connectionRequests: 75,
  messages: 100,
  inmails: 25,
  profileViews: 200,
  endorsements: 50,
  likes: 50,
  followings: 50,
  emails: 200,
};

// Maps a sequence step's action type to the daily_limits field that governs it.
// "endorsements" and "followings" have no corresponding step type yet, so they're
// configurable but not currently enforced by the scheduler.
export const ACTION_TYPE_TO_LIMIT_FIELD = {
  connection_request: "connectionRequests",
  message: "messages",
  follow_up: "messages",
  inmail: "inmails",
  profile_visit: "profileViews",
  like_post: "likes",
  email: "emails",
};
