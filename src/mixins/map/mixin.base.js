import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Fix to make Leaflet assets be correctly inserted by webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

import store from '../store'

let baseMixin = {
  methods: {
    setupControls () {
      this.controls.forEach(control => control.addTo(this.map))
      this.$emit('controlsReady')
    },
    center (longitude, latitude, zoomLevel) {
      this.map.setView(new L.LatLng(latitude, longitude), zoomLevel || 12)
    },
    removeLayer (layer) {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer)
      }
    },
    addLayer (layer) {
      if (!this.map.hasLayer(layer)) {
        this.map.addLayer(layer)
      }
      return layer
    }
  },
  created () {
    // This is the right place to declare private members because Vue has already processed observed data
    this.controls = []
  },
  mounted () {
    // Initialize the map now the DOM is ready
    this.map = L.map('map').setView([46, 1.5], 5)
    this.$on('mapReady', _ => {
      this.setupControls()
    })
  },
  beforeDestroy () {
    this.map.remove()
  }
}

store.set('base', baseMixin)

export default baseMixin
