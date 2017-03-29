var fdstore = require('fd-chunk-store')
var hyperkdb = require('hyperlog-kdb-index')
var level = require('level')
var http = require('http')
var body = require('body/any')
var xtend = require('xtend')
var ecstatic = require('ecstatic')(__dirname + '/public')
var router = require('routes')()
var hyperlog = require('hyperlog')
var log = hyperlog(level('.data/log'), { valueEncoding: 'json' })
var turf = require('@turf/helpers')
var URL = require('url')
var series = require('run-series')

var kdb = hyperkdb({
  log: log,
  db: level('.data/index'),
  types: [ 'float', 'float' ],
  kdbtree: require('kdb-tree-store'),
  store: fdstore(4096, '.data/tree'),
  map: function (row, next) {
    if (row.value.geometry.type === 'Point') {
      console.log('map ', row.value)
      next(null, [ row.value.geometry.coordinates[1], row.value.geometry.coordinates[0] ])
    } else next()
  }
})

router.addRoute('/submit', post(function (req, res, params) {
  appendToLog(params, function (err, data) {
    console.log(JSON.stringify(data, null, 2))
    if (err) {
      res.statusCode = 500
      res.statusMessage = err.message
      res.end()
    } else {
      res.writeHead(302, {
        Location: '/'
      })
      res.end()
    }
  })
}))

router.addRoute('/queryAll', function (req, res) {
  console.log('query all')
  log.heads(function (err, heads) {
    if (err) {
      res.statusCode = 500
      res.statusMessage = err.message
      res.end()
    } else {
      res.writeHead(200, {
        'content-type': 'application/json'
      })
      res.end(JSON.stringify(logToFeatureCollection(heads)))
    }
  })
})

router.addRoute('/query', function (req, res) {
  console.log('query')
  var queryParams = URL.parse(req.url, true).query
  queryKdb(queryParams, function (err, heads) {
    if (err) {
      res.statusCode = 500
      res.statusMessage = err.message
      res.end()
    } else {
      res.writeHead(200, {
        'content-type': 'application/json'
      })
      res.end(JSON.stringify(logToFeatureCollection(heads)))
    }
  })
})

var server = http.createServer(function (req, res) {
  console.log(req.url)
  var m = router.match(URL.parse(req.url).pathname)
  if (m) {
    m.fn(req, res, m.params)
  } else {
    ecstatic(req, res)
  }
})

server.listen(process.env.PORT, function () {
  console.log('listening on: ' + server.address().port)
})

function post (fn) {
  return function (req, res, params) {
    if (req.method !== 'POST') {
      res.statusCode = 400
      res.end('not a POST\n')
    } else {
      body(req, res, function (err, pvars) {
        fn(req, res, xtend(pvars, params))
      })
    }
  }
}

function appendToLog (params, cb) {
  if (params.longitude && params.latitude) {
    var geom = turf.point([Number(params.longitude), Number(params.latitude)])
  } else {
    cb(new Error('Data must contain latitude and longitude coordinates'))
  }
  geom.properties = params
  log.add([], geom, cb)
}

function logToFeatureCollection (heads) {
  var feats = heads.map(function (item) {
    return item.value
  })
  return turf.featureCollection(feats)
}

function queryKdb (params, cb) {
  if (params.bbox) {
    var bbox = commaSplit(params.bbox)
  } else {
    var bbox = [ -180, -90, 180, 90 ]
  }
  console.log(bbox)
  var q = [ [ bbox[1], bbox[3] ], [ bbox[0], bbox[2] ] ]
  console.log(q)
  kdb.query(q, function (err, pts) {
    if (err) cb(err)
    series(pts.map(function (pt) {
      var link = pt.value.toString('hex')
      return function (cb) {
        log.get(link, cb)
      }
    }), cb)
  })
}

function commaSplit (s) {
  return s.split(',').map(Number)
}