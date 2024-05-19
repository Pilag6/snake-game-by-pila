const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const colors = require("colors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(":: Connected to MongoDB successfully!🐒 ".bgGreen.white);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

connectToMongoDB();

const HighScoreSchema = new mongoose.Schema({
    name: String,
    score: Number
});

const HighScore = mongoose.model('HighScore', HighScoreSchema);

// Get high score
app.get('/highscore', async (req, res) => {
    try {
        const highScore = await HighScore.findOne().sort({ score: -1 });
        res.json(highScore);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Save high score
app.post('/highscore', async (req, res) => {
    try {
        const { name, score } = req.body;
        const highScore = new HighScore({ name, score });
        await highScore.save();
        res.status(201).send(highScore);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
