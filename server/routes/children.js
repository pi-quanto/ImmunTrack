const express = require("express");
const { v4: uuidv4 } = require("uuid");

const db = require("../db");
const router = express.Router();

module.exports = router;

router.post("/add", (req, res) => {
    console.log(req.body);

    const {
        doctor_id,
        full_name,
        dob,
        gender,
        parent_name,
        phone,
        address,
        created_at
    } = req.body;

    db.run(
        `
  INSERT INTO children (
    id,
    doctor_id,
    full_name,
    dob,
    gender,
    parent_name,
    phone,
    address,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
        [
            uuidv4(),
            doctor_id,
            full_name,
            dob,
            gender,
            parent_name,
            phone,
            address,
            new Date().toLocaleString()
        ],
        function (err) {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Child registered successfully"
            });

        }
    );
});

router.get("/:doctor_id", (req, res) => {

  const { doctor_id } = req.params;

  db.all(
    `SELECT * FROM children
    WHERE doctor_id = ?
    ORDER BY created_at DESC`,
    [doctor_id],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        children: rows
      });

    }
  );

});

router.get("/profile/:id", (req, res) => {

  const { id } = req.params;

  db.all(
    `SELECT * FROM children
    WHERE id = ?
    ORDER BY created_at DESC`,
    [id],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        children: rows
      });

    }
  );

});

router.put("/update/:id", (req, res) => {

  const { id } = req.params;

  const {
    full_name,
    dob,
    gender,
    parent_name,
    phone,
    address
  } = req.body;

  db.run(
    `
    UPDATE children
    SET
      full_name = ?,
      dob = ?,
      gender = ?,
      parent_name = ?,
      phone = ?,
      address = ?
    WHERE id = ?
    `,
    [
      full_name,
      dob,
      gender,
      parent_name,
      phone,
      address,
      id
    ],
    function(err) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        message: "Child updated successfully"
      });

    }
  );

});