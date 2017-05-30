import L from 'leaflet'
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js'
import 'leaflet-timedimension/dist/leaflet.timedimension.control.css'
import * as layers from '../../layers'

import store from '../store'

let forecastLayersMixin = {
  data () {
    return {
      forecastLayers: []
    }
  },
  watch: {
    forecastModel: function (model) {
      this.setupForecastLayers()
    }
  },
  methods: {
    setupForecastLayers () {
      // Not yet ready
      if (!this.forecastModel) return
      // For visualization we decimate the data resolution by 2 for performance reasons
      let visualModel = {
        name: this.forecastModel.name,
        origin: this.forecastModel.origin,
        bounds: this.forecastModel.bounds,
        size: [Math.floor(0.5 * this.forecastModel.size[0]), Math.floor(0.5 * this.forecastModel.size[1])],
        resolution: [2 * this.forecastModel.resolution[0], 2 * this.forecastModel.resolution[1]]
      }

      this.forecastLayers.forEach(layer => {
        this.map.removeLayer(layer)
      })
      this.forecastLayers = []
      this.configuration.forecastLayers.forEach(layerConfig => {
        let layer = new L.Weacast[layerConfig.type](this.api, layerConfig.options)
        this.map.addLayer(layer)
        // Should come last so that we do not trigger multiple updates of data
        layer.setForecastModel(visualModel)
      })
    }
  },
  mounted () {
    let timeDimension = L.timeDimension({})
    timeDimension.on('timeload', data => {
      this.currentTime = new Date(data.time)
      this.$emit('currentTimeChanged', this.currentTime)
    })
    let timeDimensionControl = L.control.timeDimension({
      timeDimension,
      position: 'bottomright',
      speedSlider: false,
      playButton: false
    })
    this.controls.push(timeDimensionControl)
    // Make time dimension available
    this.$on('ready', _ => {
      this.map.timeDimension = timeDimension
      this.setupForecastLayers()
    })
  }
}

store.set('forecastLayers', forecastLayersMixin)

export default forecastLayersMixin
