const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose=require('mongoose')
const path =require('path');
const app=express();
dotenv.config();

connectDB();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/user',require("./routes/userRoutes"))
app.use('/api/v1/admin',require("./routes/adminRoutes"))
app.use('/api/v1/doctor',require('./routes/doctorRoutes'))

app.use(express.static(path.join(__dirname,'./client/dist')));

app.get('*',function(req,res){
    res.sendFile(path.join(__dirname,'./client/dist/index.html'));
});

const port=process.env.PORT || 8080;

app.listen(port,()=>{
     console.log(`Server is running in ${process.env.NODE_MODE} mode on port ${port}`.bgCyan.white);
})