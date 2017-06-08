import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import store from '../store'
// Fix to make Leaflet assets be correctly inserted by webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

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
        this.overlayLayersControl.removeLayer(layer)
        this.map.removeLayer(layer)
        this.checkOverlayLayersControlVisibility()
      }
    },
    addLayer (layer, name) {
      if (!this.map.hasLayer(layer)) {
        this.map.addLayer(layer)
        this.overlayLayersControl.addOverlay(layer, name)
        this.checkOverlayLayersControlVisibility()
      }
      return layer
    },
    checkOverlayLayersControlVisibility () {
      // Hidden while nothing has been loaded, default state
      this.overlayLayersControl.getContainer().style.visibility = 'hidden'
      this.map.eachLayer(_ => {
        // We know there is at least one layer to display
        this.overlayLayersControl.getContainer().style.visibility = 'visible'
      })
    }
  },
  created () {
    // This is the right place to declare private members because Vue has already processed observed data
    this.controls = []
  },
  mounted () {
    // Initialize the map now the DOM is ready
    this.map = L.map('map').setView([46, 1.5], 5)
    // Add empty basic overlays control
    this.overlayLayersControl = L.control.layers({}, {})
    this.controls.push(this.overlayLayersControl)
    this.$on('mapReady', _ => {
      this.setupControls()
      this.checkOverlayLayersControlVisibility()
    })
  },
  beforeDestroy () {
    this.map.remove()
  }
}

store.set('base', baseMixin)

export default baseMixin
