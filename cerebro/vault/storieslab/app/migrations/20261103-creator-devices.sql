CREATE TABLE creator_devices (
 id TEXT PRIMARY KEY,
 creator TEXT NOT NULL,
 token_hash TEXT NOT NULL UNIQUE,
 label TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('active','pending','denied')),
 created TEXT NOT NULL,
 expires INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX creator_devices_owner ON creator_devices(creator,state);
INSERT INTO creator_devices(id,creator,token_hash,label,state,created)
 SELECT id,id,token_hash,'Primeiro acesso','active',created FROM creators;
