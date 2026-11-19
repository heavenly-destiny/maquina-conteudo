-- Figurinhas personalizadas (10/11): briefing filled in the app by buyers of the R$ 39,90 plan
CREATE TABLE IF NOT EXISTS custom_order (
 id TEXT PRIMARY KEY, email TEXT NOT NULL, brand TEXT NOT NULL, niche TEXT NOT NULL, social TEXT, colors TEXT, style TEXT,
 phrases TEXT, logo TEXT, notes TEXT, created TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'novo', delivered TEXT
);
CREATE INDEX IF NOT EXISTS custom_order_email ON custom_order(email);
