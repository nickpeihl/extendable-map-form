var now = Date.now()

postMessage({ ready: true })

self.onmessage = function (e) {
  if (e.data) {
    var bbox = e.data.bbox || [ [-180, -90], [180, 90] ]
    var url = '/query?bbox=' + bbox.join(',')
    getJson(url, function (geojson) {
      console.log('loaded ' + geojson.features.length + ' points')
      postMessage(geojson)
    })
  }
}

function getJson (url, cb) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'json'
  xhr.setRequestHeader('Accept', 'application/json')
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300 && xhr.response) {
      cb(xhr.response)
    }
  }
  xhr.send()
}