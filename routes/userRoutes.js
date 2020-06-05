const express = require('express');
const userModel = require('../model/user');
const app = express();

app.get('/profile', async (req, res) => {
  const user = await userModel.find({});

  try {
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = app