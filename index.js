const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8081;

// database part
mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wequq3y.mongodb.net/?retryWrites=true&w=majority`,
);
const conn = mongoose.connection;
conn.on("error", (error) => console.log(error));
conn.once("open", () => console.log("Connected to Database!"));

// routes part
const authRoutes = require('./routes/authRoutes');
app.use("/auth", authRoutes);
const adminAuthRoutes = require('./routes/adminAuthRoutes');
app.use("/adminAuth", adminAuthRoutes);
const adminRoutes = require('./routes/adminRoutes');
app.use("/admin", adminRoutes);

app.listen(PORT, () => console.log(`Server ready and running on PORT ${PORT}!`));