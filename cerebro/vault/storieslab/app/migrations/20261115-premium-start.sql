-- New Hubla Premium offers: 30 days from the first app login, independent of Basic.
-- Existing offers and their prior indefinite access are unchanged.
CREATE TABLE IF NOT EXISTS premium_start (email TEXT PRIMARY KEY, at TEXT NOT NULL);
