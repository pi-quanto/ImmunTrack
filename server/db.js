const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./Immunization.db');

//children table
db.run(`CREATE TABLE IF NOT EXISTS children(
    id TEXT PRIMARY KEY,
  full_name TEXT,
  dob TEXT,
  gender TEXT,
  parent_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS vaccine(
      id TEXT PRIMARY KEY,
  child_id TEXT,
  vaccine_name TEXT,
  dose TEXT,
  date_given TEXT,
  next_due_date TEXT,
  created_at TEXT
  )`);

  module.exports = db;
  db.close();
  console.log("Execution complete");


