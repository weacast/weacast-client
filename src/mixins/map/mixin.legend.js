import L from 'leaflet'
import 'leaflet-legend/leaflet-legend.js'
import 'leaflet-legend/leaflet-legend.css'
import store from '../store'

let legendMixin = {
   methods: {
    getLabelsForUnit(colorMap, unit, transform) {
      let labels = ['<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background: white">' + unit.toUpperCase() + '</span> ']
      for (var i = 0; i < colorMap.length; i++) {
        labels.push('<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background:' +
          colorMap[i].color + '">' + transform(colorMap[i].value).toFixed(0) +'</span> ')
      }
      return labels
    },
    getHtmlForUnit(colorMap, unit, nextUnit, transform = value => value) {
      let labelsForUnit = this.getLabelsForUnit(colorMap, unit, transform)
      return '<div title="Click to convert speed to '+ nextUnit + '" style="position:absolute; cursor:pointer;">'+ labelsForUnit.join('<br>') +'</div>'
    },
    setColorMap(colorMap) {
      // Build legend/labels for each unit
      let html = [
        this.getHtmlForUnit(colorMap, 'm/s', 'kt'),
        this.getHtmlForUnit(colorMap, 'kt', 'm/s', value => value * 1.94384)
      ]
      let currentUnitIndex = 0
      if (this.forecastLayer.options && this.forecastLayer.options.displayOptions &&
          this.forecastLayer.options.displayOptions.speedUnit === 'kt') {
        currentUnitIndex = 1
      }
      this.legendControl._container.innerHTML = html[currentUnitIndex]
      this.legendControl._container.addEventListener('click', _ => {
        currentUnitIndex = (currentUnitIndex + 1) % html.length
        this.legendControl._container.innerHTML = html[currentUnitIndex]
      })
     },
     show() {
      this.legendControl.addTo(this.map)
      let colorMap = this.forecastLayer.getColorMap()
      // Nothing to display ?
      if (colorMap.length === 0) {
        this.hide()
      } else {
        this.setColorMap(colorMap)
      }
     },
     hide () {
      this.forecastLayer.off('data', this.show)
      this.forecastLayer = null
      this.legendControl.remove()
     }
  },
  mounted () {
    this.legendControl = new L.Control.Legend({ 
      position: 'topleft'
    })
    //this.controls.push(this.legendControl)          
    this.map.on('layeradd', event => {
      // We only manage forecast layers
      if (event.layer instanceof L.Weacast.ForecastLayer) {
        this.forecastLayer = event.layer
        // We need to wait until data is here because it is require to get color map
        this.forecastLayer.on('data', this.show)
      }
    })
    this.map.on('layerremove', event => {
      if (this.forecastLayer === event.layer) {
        this.hide()
      }
    })
  }
}

store.set('legend', legendMixin)

export default legendMixin
