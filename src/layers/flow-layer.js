import L from 'leaflet'
import 'leaflet-velocity/dist/leaflet-velocity.js'
import 'leaflet-velocity/dist/leaflet-velocity.css'
import { ForecastLayer } from './forecast-layer'

let FlowLayer = ForecastLayer.extend({

  initialize (api, options) {
    let layer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Wind',
        position: 'bottomright',
        emptyString: 'No wind data'
      },
      // FIXME : make this dynamic
      minVelocity: 3,           // used to align color scale
      maxVelocity: 20,          // used to align color scale
      velocityScale: 0.005,     // modifier for particle animations, arbitrarily defaults to 0.005
      colorScale: null,
      data: null                // data will be requested on-demand
    })
    ForecastLayer.prototype.initialize.call(this, api, layer, options)

    // Format in leaflet-velocity layer data model
    this.uFlow = {
      header: {
        parameterCategory: 2,
        parameterNumber: 2
      },
      data: []
    }
    this.vFlow = {
      header: {
        parameterCategory: 2,
        parameterNumber: 3
      },
      data: []
    }
  },

  setData (data) {
    this.uFlow.data = data[0].data
    this.vFlow.data = data[1].data
    this._baseLayer.setData([this.uFlow, this.vFlow])
  },

  setForecastModel (model) {
    // Format in leaflet-velocity layer data model
    let modelHeader = {
      nx: model.size[0],
      ny: model.size[1],
      lo1: model.origin[0],
      la1: model.origin[1],
      dx: model.resolution[0],
      dy: model.resolution[1]
    }
    Object.assign(this.uFlow.header, modelHeader)
    Object.assign(this.vFlow.header, modelHeader)
    ForecastLayer.prototype.setForecastModel.call(this, model)
  }

})

export { FlowLayer }
