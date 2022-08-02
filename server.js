'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Event = require('./models/event.js');
const { default: axios } = require('axios');

mongoose.connect(process.env.DATABASE_URL)

const PORT = process.env.PORT || 3001

const app = express();
const hotelKey = process.env.HOTEL_TOKEN
const URL = "https://api.makcorps.com/free/seattle";

app.use(cors());

app.use(express.json());

app.get('/events', async (request, response, next) => {

  let header = {
    "username": "erexie",
    "password": "JOOJOOman42!!"
  }
  

  try { 
let tokendata = await axios.post('https://api.makcorps.com/auth', header)
let authToken = {
  Authorization: `JWT ${tokendata.data.access_token}`
}
console.log(authToken)

let config = {
  headers:{Authorization: `JWT ${tokendata.data.access_token}`},
  url:'https://api.makcorps.com/free/london',
  method: 'get'
}
let res = await axios(config)
console.log(res.data.Comparison[0][1])

} catch (e){
  console.log(e)
}
//   let token = tokendata;
//   console.log(token);

// let authToken = {
//   "Authorization": `${token}`
// }
// console.log(authToken);
// try {
// let res2 = await axios.get('https://api.makcorps.com/free/london', authToken)
  
// } catch (e) {
//   console.log(e)
// };


Event.find()
  .then(eventEnsemble => {
    response.send(eventEnsemble);
  })
})


app.post('/events', (request, response, next) => {
  console.log(request.body);
  let { location, weather, airfare } = request.body;
  if (!location) {
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
  try {
    await Event.deleteOne({ _id: id });
    Event.find()
      .then(eventEnsemble => {
        response.send(eventEnsemble);
      });
  }
  catch (e) {
    next(e);
  }
})

app.use((error, req, res, next) => {
  res.status(500).send(error);
})

app.listen(PORT, () => {
  console.log('Server Running');
})