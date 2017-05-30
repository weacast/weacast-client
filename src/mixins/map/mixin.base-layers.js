import L from 'leaflet'
import 'leaflet-basemaps/L.Control.Basemaps.js'
import 'leaflet-basemaps/L.Control.Basemaps.css'

import store from '../store'

let baseLayersMixin = {
  data () {
    return {
      baseLayers: []
    }
  },
  methods: {
    setupBaseLayers () {
      this.configuration.baseLayers.forEach(baseLayer => {
        this.baseLayers.push(L[baseLayer.type](...baseLayer.arguments))
      })
    }
  },
  mounted () {
    this.setupBaseLayers()
    let baseLayersControl = L.control.basemaps({
      basemaps: this.baseLayers,
      position: 'bottomleft',
      tileX: 0,  // tile X coordinate
      tileY: 0,  // tile Y coordinate
      tileZ: 1   // tile zoom level
    })
    this.controls.push(baseLayersControl)
  }
}

store.set('baseLayers', baseLayersMixin)

export default baseLayersMixin
