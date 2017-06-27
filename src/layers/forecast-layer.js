import L from 'leaflet'
import 'leaflet-timedimension'

let ForecastLayer = L.TimeDimension.Layer.extend({

  initialize (api, layer, options) {
    this.api = api
    L.TimeDimension.Layer.prototype.initialize.call(this, layer, options)
  },

  onAdd (map) {
    L.TimeDimension.Layer.prototype.onAdd.call(this, map)
    map.addLayer(this._baseLayer)
    if (this._timeDimension && this._timeDimension.getCurrentTime()) {
      this.currentForecastTime = new Date(this._timeDimension.getCurrentTime())
      this.fetchData()
    }
  },

  _onNewTimeLoading (event) {
    this.currentForecastTime = new Date(event.time)
    this.fetchData()
  },

  isReady (time) {
    return (this.downloadedForecastTime ? this.downloadedForecastTime.getTime() === time : false)
  },

  _update () {
    // To be more reactive update is done directly after download not when the layer check is performed
    return true
  },

  fetchAvailableTimes () {
    if (!this.options.elements || this.options.elements.length === 0 || !this._timeDimension) return
    // We assume that if multiple elements all have the same forecast times because sharing the underlying forecast model
    return this.api.getService(this.forecastModel.name + '/' + this.options.elements[0]).find({
      query: {
        $paginate: false,
        $select: ['forecastTime']
      }
    })
    .then(response => {
      let times = response.map(item => item.forecastTime)
      this._timeDimension.setAvailableTimes(times.join(), 'replace')
    })
  },

  getQuery () {
    // Default implementation
    return {
      query: {
        time: this.currentForecastTime.toISOString(),
        $select: ['forecastTime', 'data', 'minValue', 'maxValue'],
        $paginate: false,
        // Resample according to input parameters
        oLon: this.forecastModel.origin[0],
        oLat: this.forecastModel.origin[1],
        sLon: this.forecastModel.size[0],
        sLat: this.forecastModel.size[1],
        dLon: this.forecastModel.resolution[0],
        dLat: this.forecastModel.resolution[1]
      }
    }
  },

  setData (data) {
    // To be implemented
  },

  fetchData () {
    // Not yet ready
    if (!this.forecastModel || !this.currentForecastTime) return
    // Already up-to-date ?
    if (this.downloadedForecastTime &&
        (this.currentForecastTime.getTime() === this.downloadedForecastTime.getTime())) return

    // Query data for current time
    let query = this.getQuery()
    let queries = []
    for (let element of this.options.elements) {
      queries.push(this.api.getService(this.forecastModel.name + '/' + element).find(query))
    }

    return Promise.all(queries)
    .then(results => {
      // To be reactive directly set data after download, flatten because find returns an array even if a sngle element is selected
      this.setData([].concat(...results))
    })
  },

  setForecastModel (model) {
    this.forecastModel = model
    // This will launch a refresh
    this.fetchAvailableTimes()
  }

})

L.Weacast = {}
L.Weacast.ForecastLayer = ForecastLayer
export { ForecastLayer }
