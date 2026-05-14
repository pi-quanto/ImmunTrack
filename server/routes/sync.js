const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/", (req, res) => {

  const {
    children,
    immunizations
  } = req.body;

  // sync children
  if (children && children.length > 0) {

    children.forEach((child) => {

      db.run(
        `
        INSERT OR IGNORE INTO children (
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
          child.id,
          child.doctor_id,
          child.full_name,
          child.dob,
          child.gender,
          child.parent_name,
          child.phone,
          child.address,
          child.created_at
        ]
      );

    });

  }

  // sync immunizations
  if (
    immunizations &&
    immunizations.length > 0
  ) {

    immunizations.forEach((vaccine) => {

      db.run(
        `
        INSERT OR IGNORE INTO immunizations (
          id,
          child_id,
          vaccine_name,
          date_given,
          administered_by,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          vaccine.id,
          vaccine.child_id,
          vaccine.vaccine_name,
          vaccine.date_given,
          vaccine.administered_by,
          vaccine.created_at
        ]
      );

    });

  }

  res.json({
    success: true,
    message: "Offline records synced successfully"
  });

});

module.exports = router;                                                          