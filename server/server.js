const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express());

app.get('/', (req,res) =>{
    res.send("Immunization Sync Server Running");
});

app.listen(5000, ()=>console.log(`Server running on 5000`)
);