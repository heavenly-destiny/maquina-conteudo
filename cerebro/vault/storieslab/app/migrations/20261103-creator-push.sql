CREATE TABLE IF NOT EXISTS creator_push (
 endpoint TEXT PRIMARY KEY, creator TEXT NOT NULL, created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS creator_push_owner ON creator_push(creator);
CREATE TABLE IF NOT EXISTS creator_push_deliveries (
 endpoint TEXT NOT NULL, sale TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
 updated TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(endpoint,sale)
);
