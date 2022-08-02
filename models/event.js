'use strict'

const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const eventSchema = new Schema({
  location: String,
  weather: String,
  airfare: Number
});

module.exports = model('Event', eventSchema);
