'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Event = require('./models/event.js');
const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

mongoose.connect(process.env.DATABASE_URL)

const PORT = process.env.PORT || 3001

const app = express();

app.use(cors());

app.use(express.json());

class Hotels {
  constructor(obj) {
    this.name = obj[0].hotelName
    this.bestPrice = obj[1][0]
  }
}

class Events {
  constructor(obj) {
    this.title = obj.title
    this.startDate = obj.start.slice(0, 10)
    this.startTime = obj.start.slice(11, 19)
    this.endDate = obj.end.slice(0, 10)
    this.endTime = obj.end.slice(11, 19)
    // this.description = obj.description || obj.entities[0].description
    // this.address = obj.entities[0].formatted_address || obj.entities[1].formatted_address
  }
}

function verifyUser(request, response, next) {
  try {
    const token = request.headers.authorization.split(' ')[1];
    jwt.verify(token, getKey, {}, function(err, user) {
      request.user = user;
      next();
    });
  } catch(e) {
    next('not authorized');
  }
}

const client = jwksClient({
  jwksUri: 'https://dev-zlkci082.us.auth0.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

app.use(verifyUser);
app.use((request, response, next) => {
  console.log(request.user);
  console.log('Almost made it');
  next();
});



app.get('/login', (request, response) => {
  response.send('you made it');
});

app.get('/hotels', async (request, response, next) => {

  //let {eventType, depLocation, arrLocation, fromDate, toDate } = request.query.body;
  //let eventType = 'academic';
  //let depLocation = 'seattle';
  let arrLocation = request.query.city;
  //let fromDate = '2022-08-07';
  //let toDate = '2022-08-14';

  let header = {
    "username": "erexie",
    "password": "JOOJOOman42!!"
  }

  try {
    let tokendata = await axios.post('https://api.makcorps.com/auth', header)
    let authToken = {
      Authorization: `JWT ${tokendata.data.access_token}`
    }

    let config = {
      headers: { Authorization: `JWT ${tokendata.data.access_token}` },
      url: `https://api.makcorps.com/free/${arrLocation}`,
      method: 'get'
    }
    await axios(config)
let res = await axios(config)
    const responseTrimmed = (res.data.Comparison.slice(0, 5));
    let hotelData = responseTrimmed.map(hotel => new Hotels(hotel))
    
    response.send(hotelData)

  } catch (e) {
    console.log(e)
  }

  // Event.find()
  //   .then(eventEnsemble => {
  //     response.send(eventEnsemble);
  //   })
})

app.get('/flights', async (request, response, next) => {
console.log(request.query)
let {eventType, depLocation, arrLocation, fromDate, toDate } = request.query;
//let eventType = 'academic';
// let depLocation = 'seattle';
// let arrLocation = 'london';
// let fromDate = '2022-08-07';
//let toDate = '2022-08-14';
  
  try{

    let depAirport = await axios.get(`https://api.flightapi.io/iata/${process.env.FLIGHT_API}/${depLocation}/airport`)
    let arrAirport = await axios.get(`https://api.flightapi.io/iata/${process.env.FLIGHT_API}/${arrLocation}/airport`)
    // console.log(depAirport);

    let depIata = depAirport.data.data[0].iata;
    // console.log(depIata);
    let arrIata = arrAirport.data.data[0].iata;

    let info = await axios.get(`https://api.flightapi.io/onewaytrip/${process.env.FLIGHT_API}/${depIata}/${arrIata}/${fromDate}/1/0/0/Economy/USD`);
    // console.log(info.data.scores);
    //obj: (object) All of the trip scores, higher is better
    let obj = info.data.scores;
    // optimalFlightString: (string) id for the best flight
    let optimalFlightString = Object.entries(obj).sort((a,b) => {
      if(a[1] < b[1]){
        return 1;
      }
      else if(a[1] > b[1]){
        return -1;
      }
      else{
        return 0;
      }
    })[0][0];
    // console.log(optimalFlightString);
    // topFlightArray: (array) All of the different prices for the same flight path - the websites have different prices
    let topFlightArray = info.data.fares.filter(e => e.tripId === optimalFlightString);
    // console.log(topFlightArray);
    //legId: (string) Used to connect price to flight info
    let legId = info.data.trips.find(e => e.id === optimalFlightString).legIds[0];
    // console.log(legId);
    //flightObj: (obj) Contains information about departure, arrival, airports, etc.
    let flightObj = info.data.legs.find(e => e.id === legId);
    // console.log(flightObj);

    //To be sent back to the front end
    let reObject = {
      total: topFlightArray[0].price.totalAmount,
      bookingUrl: topFlightArray[0].handoffUrl,
      departureTime: flightObj.departureTime,
      arrivalTime: flightObj.arrivalTime,
      stopOverCount: flightObj.stopoversCount
    }
    //Sending to the client
    response.send(reObject);
  }
  catch(e){
    console.log(e)
  }
})

app.get('/events', async (request, response, next) => {
  let {eventType, depLocation, arrLocation, fromDate, toDate } = request.query;
  // let eventType = 'sports';
  //let depLocation = 'seattle';
  // let arrLocation = 'seattle';
  // let fromDate = '2022-08-07';
  // let toDate = '2022-08-14';
  //let query = ''
  try {
    let config = {
      headers: { Authorization: `Bearer ${process.env.BEARER_API}` },
      url: `https://api.predicthq.com/v1/places/?q=${arrLocation}`,
      method: 'get'
    }
    let res = await axios(config)
    // console.log(res)
    let id = res.data.results[0].id;
    // console.log(id);

    let config2 = {
      headers: { Authorization: `Bearer ${process.env.BEARER_API}` },
      url: `https://api.predicthq.com/v1/events/?place.scope=${id}&active.gte=${fromDate}&active.lte=${toDate}&category=${eventType}&sort=rank`,
      method: 'get'
    }
    let res2 = await axios(config2);

    // console.log(res2.data.results[0])

    let responseTrimmed = res2.data.results.slice(0,5);
    let eventData = responseTrimmed.map(event => new Events(event));
    response.send(eventData);
  } 
  
  catch (e) {
    console.log(e)
  }

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