'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Event = require('./models/event.js');

mongoose.connect(process.env.DATABASE_URL)

const PORT = process.env.PORT || 3001

const app = express();
app.use(cors());

app.use(express.json());

app.get('/events', (request, response) => {
  Event.find()
    .then(eventEnsemble => {
      response.send(eventEnsemble);
    })
})

app.post('/events', (request, response, next) => {
  console.log(request.body);
  let {location, weather, airfare} = request.body;
  if(!location){
    next('bad request');
  }
  let event = new Event({
    location,
    weather,
    airfare: parseInt(airfare)
  })
  event.save()
    .then(results => {
      console.log(results);
      response.send(results);
    })
    .catch(e => {
      next(e);
    })
})

app.delete('/events/:id', async (request, response, next) => {
  let id = request.params.id;
  try{
    await Event.deleteOne({_id: id});
    Event.find()
      .then(eventEnsemble => {
        response.send(eventEnsemble);
      });
  }
  catch(e) {
    next(e);
  }
})

app.use((error, req, res, next) => {
  res.status(500).send(error);
})

app.listen(PORT, () => {
  console.log('Server Running');
})