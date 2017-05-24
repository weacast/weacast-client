import HeatmapOverlay from 'leaflet-heatmap'
import { ForecastLayer } from './forecast-layer'

let HeatLayer = ForecastLayer.extend({

  initialize (api, options) {
    let layer = new HeatmapOverlay({
      // radius should be small ONLY if scaleRadius is true (or small radius is intended)
      // if scaleRadius is false it will be the constant radius used in pixels
      radius: 0.25,
      minOpacity: 0,
      maxOpacity: 0.8,
      // scales the radius based on map zoom
      scaleRadius: true,
      // custom gradient colors
      /*
      gradient: {
        // enter n keys between 0 and 1 here
        // for gradient color customization
        '0': 'black',
        '1': 'white'
      },
      */
      // if set to false the heatmap uses the global maximum for colorization
      // if activated: uses the data maximum within the current map boundaries
      //   (there will always be a red spot with useLocalExtremas true)
      useLocalExtrema: true,
      // which field name in your data represents the latitude - default "lat"
      latField: 'lat',
      // which field name in your data represents the longitude - default "lng"
      lngField: 'lng',
      // which field name in your data represents the data value - default "value"
      valueField: 'value'
    })
    ForecastLayer.prototype.initialize.call(this, api, layer, options)
    // Format in leaflet-heatmap layer data model
    this.heat = {
      min: 0,                   // min will be adjusted on-demand
      max: 0,                   // max will be adjusted on-demand
      data: []                  // data will be requested on-demand
    }
  },

  setData (data) {
    this.heat.min = data[0].minValue
    this.heat.max = data[0].maxValue
    let heatValues = data[0].data
    // Depending on the model longitude/latitude increases/decreases according to grid scanning
    let lonDirection = (this.forecastModel.origin[0] === this.forecastModel.bounds[0] ? 1 : -1)
    let latDirection = (this.forecastModel.origin[1] === this.forecastModel.bounds[1] ? 1 : -1)
    this.heat.data = []
    for (let j = 0; j < this.forecastModel.size[1]; j++) {
      for (let i = 0; i < this.forecastModel.size[0]; i++) {
        let value = heatValues[i + j * this.forecastModel.size[0]]
        // Offset by pixel center
        let lng = this.forecastModel.origin[0] + lonDirection * (i * this.forecastModel.resolution[0] + 0.5 * this.forecastModel.resolution[0])
        let lat = this.forecastModel.origin[1] + latDirection * (j * this.forecastModel.resolution[1] + 0.5 * this.forecastModel.resolution[1])
        this.heat.data.push({
          lat,
          lng,
          value
        })
      }
    }
    // To be reactive directly set data after download
    this._baseLayer.setData(this.heat)
  }
})

export { HeatLayer }
