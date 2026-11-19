-- Weekly ranking (rank.js). Also created lazily by the code.
CREATE TABLE IF NOT EXISTS rankd (day TEXT NOT NULL, email TEXT NOT NULL, c INTEGER NOT NULL DEFAULT 0, p INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, email));
CREATE TABLE IF NOT EXISTS rankp (email TEXT PRIMARY KEY, name TEXT, photo TEXT, hidden INTEGER NOT NULL DEFAULT 0, updated TEXT);
