const express = require("express");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const emailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("user", emailSchema);
//  getting the form
app.get("/", (req, res) => {
  const name = "Ayush";
  res.render("index", { user: name });
});

// form submission
app.post("/schedule-email", async (req, res, next) => {
  const { email, time, message } = req.body;
  console.log("line 46",req.body);

  try {
    const loggedUser = await user.create({ email, message });
    cron.schedule(time, (loggedUser) => {
      console.log(loggedUser);
      const isMailSent = sendEmail(email, message);
      console.log(`Email sent to ${email} at ${new Date().toLocaleString()}`);
      res.status(201).json({ success: true, message: loggedUser });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//fetching data
function sendEmail(toEmail, customMessage) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ayush.ghosal@iemlabs.com",
      pass: "qqdljtjioezdvjwf",
    },
  });

  const mailOptions = {
    from: "ayush.ghosal@iemlabs.com",
    to: toEmail,
    subject: "Scheduled Email",
    text: customMessage || "Default message if no custom message provided.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return false;
      console.error(`Error sending email: ${error.message}`);
    } else {
      return true;
      console.log(`Email sent: ${info.response}`);
    }
  });
}

mongoose
  .connect("mongodb://localhost:27017/email_db")
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("COULD NOT CONNECT TO THE DB");
  });
// Start the server
