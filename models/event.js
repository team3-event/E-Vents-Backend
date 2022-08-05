'use strict'

const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const eventSchema = new Schema({
  userId: String,
  groupId: Number,
  event: {},
  flight: {},
  hotels: {}
});

module.exports = model('Event', eventSchema);
