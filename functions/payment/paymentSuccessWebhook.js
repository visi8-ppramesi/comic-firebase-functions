const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const matchSignature = require("../middlewares/matchSignature.js");

const app = express();
app.use(cors({origin: true}));
app.use(matchSignature);
app.post("/", (req, res) => {

});

exports.createGopayCharge = functions
    .region("asia-east2")
    .https
    .onRequest(app);
