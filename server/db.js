const sqlite = require('sqlite3').verbose();
const path = require('path')
const db = new sqlite.Database(
  path.join(__dirname, "Immunization.db")
);


//doctor table
db.run(`CREATE TABLE IF NOT EXISTS doctor(
  id TEXT PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  clinic_name TEXT,
  role TEXT,
  created_at TEXT
)`);

//children table
db.run(`CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  doctor_id TEXT,
  full_name TEXT,
  dob TEXT,
  gender TEXT,
  parent_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TEXT
)`);

  //vaccine table
  db.run(`CREATE TABLE IF NOT EXISTS vaccine(
       id TEXT PRIMARY KEY,
       doctor_id TEXT,
  child_id TEXT,
  vaccine_name TEXT,
  dose TEXT,
  date_given TEXT,
  next_due_date TEXT,
  administered_by TEXT,
  created_at TEXT
  )`);

  module.exports = db;
  
  console.log("Execution complete");


