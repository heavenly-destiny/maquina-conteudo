-- one device per customer (src/device.js)
CREATE TABLE IF NOT EXISTS dev (
  email TEXT PRIMARY KEY,
  device TEXT NOT NULL,
  sib TEXT, net TEXT, os TEXT,
  at INTEGER NOT NULL,
  pdev TEXT, pcode TEXT, pexp INTEGER NOT NULL DEFAULT 0, tries INTEGER NOT NULL DEFAULT 0, pmail INTEGER NOT NULL DEFAULT 0, plabel TEXT
);
-- browsers already signed in before the lock shipped (owner: "sem deslogar ninguém")
CREATE TABLE IF NOT EXISTS devold (email TEXT NOT NULL, device TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (email, device));
