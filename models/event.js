'use strict'

const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const eventSchema = new Schema({
  userId: Number,
  groupId: Number,
  event: {},
  flight: {},
  hotels: {}
});

module.exports = model('Event', eventSchema);
