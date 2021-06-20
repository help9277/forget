const express = require('express');
const mongoose = require('mongoose');
const Data = require('./module/emailschema');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
JWT_SECRET = "somereallysecret123";
const nodemailer = require('nodemailer');
const app = express();
var transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'csecec.1802177@gmail.com',
    pass:'<password>'
  }
});
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  
const dbUri = 'mongodb+srv://<username>:<password>@cluster0.4yhpu.mongodb.net/Node-data?retryWrites=true&w=majority';
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true})
.then((result)=>{
console.log('connected to db');
})
.catch((err)=>{
console.log(err);
})
app.set('view engine', 'ejs');



app.get('/forget-password', async (req, res) => {
  const { email } = req.body;
  const user = await Data.findOne({ email });
  if (user) {
    const token = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: "15m",
    });

    await Data.findOneAndUpdate(
      { email },
      {
        $set: {
          resetToken: token,
        },
      }
    );
    const data = {
      from: "csecec.1802177@gmail.com",
      to: email,
      subject: "Reset link",
      html: `<h2>PLease click on given link to reset your account</h2>
            <a href=`http://localhost:3000/api/changepassword/?token=${token}`></a>
     `,
    };
    try {
      await transporter.sendMail(data);
      res.send("Email sent Successfully!");
    } catch (err) {
      console.log("error occured while sending email!", err);
    }
  } else {
    res.send("User not found!");
  }
  });
