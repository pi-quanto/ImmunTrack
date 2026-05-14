const express = require("express");
const { v4: uuidv4 } = require("uuid");

const db = require("../db");
const router = express.Router();

module.exports = router;

router.post("/vaccine", (req, res) => {
    const {
        child_id,
        vaccine_name,
        dose,
        date_given,
        next_due_date,
        administered_by
    } = req.body;

    db.run(
        `INSERT INTO vaccine (
  id,
  child_id,
  vaccine_name,
  dose,
  date_given,
  next_due_date,
  administered_by,
  created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            uuidv4(),
            child_id,
            vaccine_name,
            dose,
            date_given,
            next_due_date,
            administered_by,
            new Date().toLocaleString()
        ],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }
            res.json({
                success: true,
                message: "Vaccine registered successfully"
            });

        });
});

router.get("/history/:child_id", (req, res) => {

  const { child_id } = req.params;

  db.all(
    `SELECT * FROM vaccine
    WHERE child_id = ?
    ORDER BY date_given DESC`,
    [child_id],
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