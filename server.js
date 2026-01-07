const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
// Remove or install cors: const cors = require('cors');

const app = express();
dotenv.config();

connectDB();

app.use(express.json());
app.use(morgan('dev'));
// Remove or install: app.use(cors());

app.use('/api/v1/user', require("./routes/userRoutes"));
app.use('/api/v1/admin', require("./routes/adminRoutes"));
app.use('/api/v1/doctor', require('./routes/doctorRoutes'));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
  );
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`.bgCyan.white);
});