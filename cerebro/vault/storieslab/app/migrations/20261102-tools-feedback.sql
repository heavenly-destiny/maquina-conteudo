CREATE TABLE IF NOT EXISTS tool_uses (
 email TEXT NOT NULL, tool TEXT NOT NULL, day TEXT NOT NULL, item TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('reserved','used')), expires INTEGER NOT NULL DEFAULT 0,
 created TEXT NOT NULL, PRIMARY KEY(email,tool,day,item)
);
CREATE INDEX IF NOT EXISTS tool_uses_account ON tool_uses(email,tool,state);
CREATE TABLE IF NOT EXISTS tool_trial_start(email TEXT NOT NULL,tool TEXT NOT NULL,day TEXT NOT NULL,PRIMARY KEY(email,tool));
CREATE TABLE IF NOT EXISTS feedback (
 id TEXT PRIMARY KEY, email TEXT NOT NULL, kind TEXT NOT NULL, tool TEXT NOT NULL,
 message TEXT NOT NULL, created TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'novo'
);
CREATE INDEX IF NOT EXISTS feedback_created ON feedback(created);
