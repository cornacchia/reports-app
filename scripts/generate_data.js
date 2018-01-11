/** Generate data for tests */

const async = require('async')
const Chance = require('chance')
const MongoClient = require('mongodb').MongoClient
const config = require('../config')
const chance = new Chance()

// CONFIG

const TIME_LAPSE = 1000 * 60 * 60 * 24 * 31 * 4 // 4 months
const DAY = 1000 * 60 * 60 * 24

// DATA

// password = 123
const USERS_PASSWORD = '169da216e965a230634ba30581b7047ac29c96b83b0da0f0390dd77f69a07fc33a5ef40a7b1304b2ad34c757f2c03f9c149bfe98db38cf01fbd934f327727dfc'

// users
const USERS = [
  {
    username: 'admin',
    firstName: 'Ada',
    lastName: 'Lovelace',
    type: 'admin',
    password: USERS_PASSWORD
  },
  {
    username: 'user',
    firstName: 'Virginia',
    lastName: 'Woolf',
    type: 'user',
    password: USERS_PASSWORD
  }
]

const SITES = [
  { code: '101', name: 'Via Mordor' },
  { code: '202', name: 'Via Gondor' },
  { code: '303', name: 'Via Rohan' },
  { code: '404', name: 'Via Wormhole' },
  { code: '505', name: 'Via Col Vento' }
]

const VEHICLES = [
  { plaque: '101-1111', description: 'Camion ribaltabile' },
  { plaque: '202-2222', description: 'Tir' },
  { plaque: '303-3333', description: 'Daily con ragno' },
  { plaque: '404-4444', description: 'Furgone telonato' }
]

const HIGHWAYS = [
  { name: 'Roma Est' },
  { name: 'Roma Ovest' },
  { name: 'Milano Est' },
  { name: 'Milano Nord' },
  { name: 'Bologna Sud' }
]

const METEO = [
  'sunny', 'cloudy', 'rainy', 'snowy'
]

function cleanCollection(collection, cb) {
  collection.deleteMany({}, err => {
    if (err) {
      console.error(err)
      return cb(err)
    }

    return cb()
  })
}

function cleanDb (db, cb) {
  console.log('Cleaning db...')
  const userCollection = db.collection('user')
  const siteOptionsCollection = db.collection('siteOptions')
  const vehicleOptionsCollection = db.collection('vehicleOptions')
  const highwayOptionsCollection = db.collection('highwayOptions')
  const reportCollection = db.collection('report')
  const vehicleCollection = db.collection('vehicle')

  async.parallel([
    async.apply(cleanCollection, userCollection),
    async.apply(cleanCollection, siteOptionsCollection),
    async.apply(cleanCollection, vehicleOptionsCollection),
    async.apply(cleanCollection, highwayOptionsCollection),
    async.apply(cleanCollection, reportCollection),
    async.apply(cleanCollection, vehicleCollection)
  ], err => {
    if (err) return cb(err)
    return cb()
  })
}

function insertUsers (db, cb) {
  console.log('Inserting users...')
  const userCollection = db.collection('user')
  const users = USERS

  userCollection.insertMany(users, err => {
    if (err) {
      console.error(err)
      return cb(err)
    }

    return cb()
  })
}

function insertSiteOptions (db, cb) {
  console.log('Inserting sites...')
  const siteOptionsCollection = db.collection('siteOptions')
  const sites = SITES

  siteOptionsCollection.insertMany(sites, err => {
    if (err) {
      console.error(err)
      return cb(err)
    }

    return cb()
  })
}

function insertVehicleOptions (db, cb) {
  console.log('Inserting vehicles...')
  const vehicleOptionsCollection = db.collection('vehicleOptions')
  const vehicles = VEHICLES

  vehicleOptionsCollection.insertMany(vehicles, err => {
    if (err) {
      console.error(err)
      return cb(err)
    }

    return cb()
  })
}

function insertHighwayOptions (db, cb) {
  console.log('Inserting highways...')
  const highwayOptionsCollection = db.collection('highwayOptions')
  const highways = HIGHWAYS

  highwayOptionsCollection.insertMany(highways, err => {
    if (err) {
      console.error(err)
      return cb(err)
    }

    return cb()
  })
}

function generateReports() {
  const now = Date.now()
  let start = now - TIME_LAPSE
  let result = []

  while (start < now) {
    let newDate = new Date(start)
    let adminReport = {
      user: 'admin',
      site: chance.pickone(SITES).code,
      date: newDate,
      meteo: chance.pickone(METEO),
      workStarted: new Date(newDate.setHours(chance.pickone([5,6,7], chance.pickone(0, 14, 30)))),
      workPause: chance.pickone([30, 60, 90]),
      workStopped: new Date(newDate.setHours(chance.pickone([18,19,20], chance.pickone(0, 14, 30)))),
      travelTime: chance.pickone([0, 1, 2]),
      notes: chance.sentence()
    }
    let userReport = {
      user: 'user',
      site: chance.pickone(SITES).code,
      date: newDate,
      meteo: chance.pickone(METEO),
      workStarted: new Date(newDate.setHours(chance.pickone([5,6,7], chance.pickone(0, 14, 30)))),
      workPause: chance.pickone([30, 60, 90]),
      workStopped: new Date(newDate.setHours(chance.pickone([18,19,20], chance.pickone(0, 14, 30)))),
      travelTime: chance.pickone([0, 1, 2]),
      notes: chance.sentence()
    }
    result.push(adminReport)
    result.push(userReport)
    start += DAY
  }
  return result
}

function insertReports (db, cb) {
  console.log('Inserting reports...')
  const reportCollection = db.collection('report')
  const reports = generateReports()

  reportCollection.insertMany(reports, err => {
    if (err) {
      console.error(err)
      return cb(err)
    }

    return cb()
  })
}

function generateVehicles () {
  const now = Date.now()
  let start = now - TIME_LAPSE
  let result = []

  while (start < now) {
    let vehicle = {
      user: chance.pickone(USERS).username,
      site: chance.pickone(SITES).code,
      date: new Date(start),
      vehicle: chance.pickone(VEHICLES).plaque,
      vehicleKm: chance.natural({min: 1, max: 100}),
      highwayEnter: chance.pickone(HIGHWAYS).name,
      highwayExit: chance.pickone(HIGHWAYS).name
    }
    result.push(vehicle)
    start += DAY
  }

  return result
}

function insertVehicles (db, cb) {
  console.log('Inserting vehicle reports...')
  const vehicleCollection = db.collection('vehicle')
  const vehicles = generateVehicles()

  vehicleCollection.insertMany(vehicles, err => {
    if (err) {
      console.error(err)
      return cb(err)
    }

    return cb()
  })
}

MongoClient.connect(config.db.url, (err, db) => {
  if (err) {
    return console.error(err)
  }

  console.log('Db connected...')

  async.series([
    async.apply(cleanDb, db),
    async.apply(insertUsers, db),
    async.apply(insertSiteOptions, db),
    async.apply(insertVehicleOptions, db),
    async.apply(insertHighwayOptions, db),
    async.apply(insertReports, db),
    async.apply(insertVehicles, db)
  ], err => {
    if (err) {
      console.error('[FAIL] There were errors')
    } else {
      console.log('[SUCCESS] Db populated')
    }

    db.close()
    process.exit()
  })
})
