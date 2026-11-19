ALTER TABLE creators ADD COLUMN instagram TEXT;
ALTER TABLE creators ADD COLUMN partner_approved INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX creators_instagram ON creators(instagram) WHERE instagram IS NOT NULL;
ALTER TABLE creator_clicks ADD COLUMN destination TEXT NOT NULL DEFAULT 'page';
CREATE TABLE creator_terms (
 id INTEGER PRIMARY KEY AUTOINCREMENT, creator TEXT NOT NULL,
 effective_at TEXT NOT NULL, approved INTEGER NOT NULL, rate_bps INTEGER NOT NULL
);
CREATE INDEX creator_terms_owner ON creator_terms(creator,effective_at,id);
