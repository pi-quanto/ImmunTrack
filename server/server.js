const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

const authRoutes = require("./routes/auth");
const childRoutes = require("./routes/children");
const vaccineRoutes = require("./routes/vaccine");
const dashboardRoutes = require("./routes/dashboard");

app.use(cors());
app.use("/auth", authRoutes);
app.use("/children", childRoutes);
app.use("/vaccine", vaccineRoutes);
app.use("/dashboard", dashboardRoutes);

app.get('/', (req,res) =>{
    res.send("Immunization Sync Server Running");
});





app.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);