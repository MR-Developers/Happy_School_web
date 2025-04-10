const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization,x-api-key",
  })
);

const port = process.env.Port || 3000; 

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
})