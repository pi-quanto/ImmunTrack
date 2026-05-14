const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const db = require("../db");
const router = express.Router();

module.exports = router;

router.use(express.json());
router.post("/register", async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            clinic_name
        } = req.body;

        //password hashing
        const hashPw = await bcrypt.hash(password, 10);


        //create account for doctor/practioner
       db.run(`
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  clinic_name TEXT,
  created_at TEXT
)
`);

db.run(
  `
  INSERT INTO doctors (
    id,
    full_name,
    email,
    password,
    clinic_name,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?)
  `,
  [
    uuidv4(),
    full_name,
    email,
    hashPw,
    clinic_name,
    new Date().toISOString()
  ],
  function (err) {

    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    console.log("success adding doctor");

    res.json({
      success: true,
      message: "Doctor successfully added"
    });

  }
);
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
);


//Login authentication
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    //email authentication
    db.get(
        `SELECT * FROM users WHERE LOWER(email) = LOWER(?)`,
        [email],
        async (err, doctor) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!err) {
                return res.status(404).json({
                    success: false,
                    message: "Account not found"
                });
            }
            //password authentication
            const pwMatch = await bcrypt.compare(
                password,
                doctor.password
            );
            if (!pwMatch) {
                return res.status(401).json({
                    success: false,
                    message: "the password inputed is incorrect!"
                });
            }

            //create token(unique id)
            const token = jwt.sign(
                {
                    id: doctor.id,
                    email: doctor.email
                },

                "SECRET_KEY",
                {
                    expiresIn: "7days"
                });
            res.json({
                success: true,
                token,
                doctor: {
                    id: doctor.id,
                    full_name: doctor.full_name,
                    email: doctor.email,
                    clinic_name: doctor.clinic_name
                }
            });
        }
    );
});