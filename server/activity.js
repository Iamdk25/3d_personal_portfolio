/* eslint-env node */
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function activityMiddleware({ databasePath, siteOrigin }) {
  let database;
  function db() {
    if (database) return database;
    const path = resolve(databasePath || '.portfolio-data/activity.sqlite');
    mkdirSync(dirname(path), { recursive: true });
    const connection = new DatabaseSync(path);
    connection.exec(`PRAGMA journal_mode=WAL;
      PRAGMA busy_timeout=3000;
      CREATE TABLE IF NOT EXISTS counts (kind TEXT PRIMARY KEY, total INTEGER NOT NULL);
      INSERT OR IGNORE INTO counts VALUES ('visit', 0), ('download', 0);
      CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, kind TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS count_new_event AFTER INSERT ON events BEGIN
        UPDATE counts SET total = total + 1 WHERE kind = NEW.kind;
      END;`);
    database = connection;
    return database;
  }

  return (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== '/api/activity') return next();
    const origin = req.headers.origin;
    const originAllowed = siteOrigin ? origin === siteOrigin :
      origin === 'http://' + req.headers.host || origin === 'https://' + req.headers.host;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Content-Type', 'application/json');
    if (origin && !originAllowed) { res.writeHead(403).end(); return; }
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    if (req.method !== 'GET' && req.method !== 'POST') { res.writeHead(405).end(); return; }
    try {
      if (req.method === 'POST') {
        const kind = url.searchParams.get('kind');
        const id = url.searchParams.get('id');
        if (!originAllowed || !['visit', 'download'].includes(kind) || !/^[a-f0-9]{32}$/.test(id || '')) {
          res.writeHead(400).end();
          return;
        }
        db().prepare('INSERT OR IGNORE INTO events (id, kind) VALUES (?, ?)').run(id, kind);
      }
      const totals = Object.fromEntries(db().prepare('SELECT kind, total FROM counts').all().map(row => [row.kind, row.total]));
      res.end(JSON.stringify(totals));
    } catch (error) {
      console.error('Portfolio activity storage unavailable', error.message);
      res.writeHead(503).end();
    }
  };
}
