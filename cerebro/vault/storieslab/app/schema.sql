CREATE TABLE IF NOT EXISTS ent (
  email TEXT NOT NULL,
  product TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT '',
  status INTEGER NOT NULL,
  sale TEXT,
  approved TEXT,
  updated TEXT NOT NULL,
  PRIMARY KEY (email, product, plan)
);
CREATE TABLE IF NOT EXISTS hooklog (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, body TEXT);
CREATE TABLE IF NOT EXISTS ab (day TEXT NOT NULL, v TEXT NOT NULL, e TEXT NOT NULL, plan TEXT NOT NULL DEFAULT '', n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, v, e, plan));
CREATE TABLE IF NOT EXISTS ev (day TEXT NOT NULL, email TEXT NOT NULL, e TEXT NOT NULL, k TEXT NOT NULL DEFAULT '', n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, email, e, k));
CREATE TABLE IF NOT EXISTS push (endpoint TEXT PRIMARY KEY, email TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS seen (email TEXT PRIMARY KEY, first TEXT NOT NULL, at TEXT NOT NULL, mode TEXT, pwa INTEGER NOT NULL DEFAULT 0, notif TEXT, last TEXT);
CREATE TABLE IF NOT EXISTS act (day TEXT NOT NULL, h INTEGER NOT NULL, email TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, h, email));
CREATE TABLE IF NOT EXISTS pushlog (at TEXT PRIMARY KEY, sent INTEGER, gone INTEGER, total INTEGER);
CREATE TABLE IF NOT EXISTS ref (code TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS refuse (sale TEXT NOT NULL, code TEXT NOT NULL, friend TEXT PRIMARY KEY, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS dev (
  email TEXT PRIMARY KEY,
  device TEXT NOT NULL,
  sib TEXT, net TEXT, os TEXT,
  at INTEGER NOT NULL,
  pdev TEXT, pcode TEXT, pexp INTEGER NOT NULL DEFAULT 0, tries INTEGER NOT NULL DEFAULT 0, pmail INTEGER NOT NULL DEFAULT 0, plabel TEXT
);
-- browsers already signed in before the lock shipped (owner: "sem deslogar ninguém")
CREATE TABLE IF NOT EXISTS devold (email TEXT NOT NULL, device TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (email, device));
-- CDN downloads per account per day (cdn/gate.js)
CREATE TABLE IF NOT EXISTS dl (day TEXT NOT NULL, email TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, email));
-- cloned sales pages that reported themselves (site guard)
CREATE TABLE IF NOT EXISTS clone (host TEXT PRIMARY KEY, first TEXT NOT NULL, last TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, url TEXT, ref TEXT);
-- admin SeguranÃ§a (security.js)
ALTER TABLE dev ADD COLUMN sw INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS blk (email TEXT PRIMARY KEY, at TEXT NOT NULL, note TEXT);
-- terms acceptance (worker.js TERMS_V)
CREATE TABLE IF NOT EXISTS terms (email TEXT NOT NULL, v INTEGER NOT NULL, at TEXT NOT NULL, ip TEXT, ua TEXT, device TEXT, PRIMARY KEY (email, v));
-- Figurinhas personalizadas (10/11): briefing filled in the app by buyers of the R$ 39,90 plan
CREATE TABLE IF NOT EXISTS custom_order (
 id TEXT PRIMARY KEY, email TEXT NOT NULL, brand TEXT NOT NULL, niche TEXT NOT NULL, social TEXT, colors TEXT, style TEXT,
 phrases TEXT, logo TEXT, notes TEXT, created TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'novo', delivered TEXT
);
CREATE INDEX IF NOT EXISTS custom_order_email ON custom_order(email);
-- 10/11 personalised pack files (custom_order also got: files INTEGER)
CREATE TABLE IF NOT EXISTS custom_file (oid TEXT NOT NULL, n INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY (oid, n));
-- per-sticker copy/download counts (id = slug/n), no e-mail
CREATE TABLE IF NOT EXISTS stk (day TEXT NOT NULL, id TEXT NOT NULL, e TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, id, e));
