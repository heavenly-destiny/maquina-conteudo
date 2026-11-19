-- 07/11: daily cap of 150 different full-size stickers per account (cdn/gate.js). One row per file per day.
CREATE TABLE IF NOT EXISTS dlf (day TEXT NOT NULL, email TEXT NOT NULL, path TEXT NOT NULL, PRIMARY KEY (day, email, path));
