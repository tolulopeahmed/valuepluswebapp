// Learner mode isn't ready for real users yet — Publisher is the only
// mode a deployed build should expose. Next.js sets NODE_ENV to
// "production" for `next build` (what Vercel deploys) and "development"
// for `next dev`, so this flips automatically based on how the app was
// started rather than needing a separate env var configured per
// deployment — work on Learner mode locally, push, and production still
// only shows Publisher.
export const LEARNER_MODE_ENABLED = process.env.NODE_ENV !== "production";

export const LEARNER_MODE_ETA = "November";
