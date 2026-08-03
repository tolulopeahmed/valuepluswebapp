// Learner mode isn't ready for real users yet — Publisher is the only
// mode any build should expose, dev included, until it's ready to turn
// back on. Flip this back to `process.env.NODE_ENV !== "production"`
// (dev/preview on, production off) once work on it resumes.
export const LEARNER_MODE_ENABLED = false;

export const LEARNER_MODE_ETA = "October";
