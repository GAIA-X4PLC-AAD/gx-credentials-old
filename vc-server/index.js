"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var cors = require("cors");
require("dotenv").config();
var app = express();
app.use(cors());

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

// Start listening on port 8081
app.listen(8081, async () => {
  console.log("VC server listening at http://localhost:8081");
});

// Endpoint to store vc
app.post("/storeVC", (req, res) => {
  const vc = JSON.stringify(req.body.vc);
  fs.writeFileSync(`./credentials/${req.body.did}.json`, vc);
  return res.send("Success");
});

// Endpoint to fetch vc
app.get("/fetchVC", (req, res) => {
  const did = req.query.did;
  const vc = JSON.parse(fs.readFileSync(`./credentials/${did}.json`));
  res.json(vc);
});
