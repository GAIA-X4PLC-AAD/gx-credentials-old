"use strict";
var express = require("express");
var bodyParser = require("body-parser");
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

// Use redis as a key value store for challenges
const redis = require("redis");
const client = redis.createClient();

// Start listening on port 8081
app.listen(8081, async () => {
  console.log("Email server listening at http://localhost:8081");
  // Connect to the redis client
  await client.connect();
  client.on("error", (err) => console.log("Redis Client Error", err));
});

// Endpoint to trigger sendEmail
app.post("/sendEmail", async (req, res) => {
  const receiver = req.body?.email;
  const tzAddress = req.body?.address;
  const challenge = uuid.v4();
  await sendEmail(receiver, challenge);
  await client.set(receiver + ":" + tzAddress, challenge);
  res.sendStatus(200);
});

// Endpoint to verify the challenge submitted
app.post("/verifyChallenge", async (req, res) => {
  const receiver = req.body?.email;
  const tzAddress = req.body?.address;
  const challenge = req.body?.challenge;
  const value = await client.get(receiver + ":" + tzAddress);
  if (value === challenge) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

// Send an email to receiver with challenge
const sendEmail = async (receiver, challenge) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.MAIL_SERVER_USER,
      pass: process.env.MAIL_SERVER_PWD,
    },
  });

  // Send email with defined transport object
  let info = await transporter.sendMail({
    from: '"ASCS <ascsgxprofilesserver@ascs.com>', // sender address
    to: receiver, // list of receivers
    subject: "GX Profiles - Email Verification Credential", // Subject line
    text: challenge, // plain text body
    html: "<b>" + challenge + "</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};
