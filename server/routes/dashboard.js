const express = require("express");
const { v4: uuidv4 } = require("uuid");

const db = require("../db");
const router = express.Router();

module.exports = router;

router.get("/:doctor_id", (req, res) => {
    const { doctor_id } = req.params;
    db.get(
        `
    SELECT
      COUNT(*) AS total_children
    FROM children
    WHERE doctor_id = ?
    `,
        [doctor_id],

        (err, childResult) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    err: err.message
                });
            }
            db.get(
                `
    SELECT
      COUNT(*) AS total_vaccine
    FROM vaccine
    WHERE doctor_id = ?
    `,
                [doctor_id],
                (err, vaccineResult) => {
                    if (err) {
                        res.status(500).json({
                            success: false,
                            err: err.message
                        });
                    }
                    res.json({
                        success: true,
                        dashboard: {
                            total_children:
                                childResult.total_children,

                            total_vaccines:
                                vaccineResult.total_vaccines,

                            pending_syncs: 0
                        }
                    });
                });
        });
});