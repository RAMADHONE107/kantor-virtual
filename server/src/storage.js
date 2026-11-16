import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

function ensure() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ drafts: [], runs: [], logs: [], pipelines: [] }, null, 2));
  }
}

export function readDb() {
  ensure();
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!db.drafts) db.drafts = [];
    if (!db.runs) db.runs = [];
    if (!db.logs) db.logs = [];
    if (!db.pipelines) db.pipelines = [];
    return db;
  } catch {
    return { drafts: [], runs: [], logs: [], pipelines: [] };
  }
}

export function writeDb(db) {
  ensure();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
