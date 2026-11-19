-- Premium gate (08/11): milestone gifts on the server; seeds the 4 gifts already given (ev 'gift', only in localStorage before)
CREATE TABLE IF NOT EXISTS gift (email TEXT NOT NULL, slug TEXT NOT NULL, created TEXT NOT NULL, PRIMARY KEY (email, slug));
INSERT OR IGNORE INTO gift (email, slug, created) SELECT email, k, MIN(day) FROM ev WHERE e = 'gift' AND email != '' AND k != '' GROUP BY email, k;
