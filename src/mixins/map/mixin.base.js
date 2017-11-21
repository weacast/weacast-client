import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import store from '../store'

import { FlowLayer } from '../../layers/flow-layer'
// Fix to make Leaflet assets be correctly inserted by webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

let baseMixin = {
  methods: {
    setUpLegend(){ //set up legend menu to map speed with color
        this.controls.forEach(control => {if(control.options.controlButton && control.options.controlButton.title == 'Legend'){
        let FlowLayerObj = new FlowLayer()
        let colors = FlowLayerObj._baseLayer.options.colorScale
        let min = FlowLayerObj._baseLayer.options.minVelocity
        let max = FlowLayerObj._baseLayer.options.maxVelocity
        let colorIndexForSpeed =[]
        colors.indexFor = function (m) {  // map velocity speed to a style
          return Math.max(0, Math.min((colors.length - 1),
            Math.round((m - min) / (max - min) * (colors.length - 1))));
        }
         for(let j=0; j<=max; j++){
           colorIndexForSpeed.push(colors.indexFor(j))
         }
        let mpsToKnot = function(mps){
          return mps*1.94384
        }
          let labelsForMps = ['<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background: white">MPS</span> ']
          let labelsForKnot = ['<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background:white">KT</span> ']
          for (var i = 0; i < colors.length; i++) {
            labelsForMps.push(
              '<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background:' + colors[i]+ '">'+ colorIndexForSpeed.indexOf(i) +'</span> '
            )
            labelsForKnot.push(
              '<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background:' + colors[i]+ '">'+ (mpsToKnot(colorIndexForSpeed.indexOf(i))).toFixed(0) +'</span> '
            )
          }
          let flag = 0
          let Mps ='<div title="Click to convert speed from Mps to Knot" style="position:absolute; cursor:pointer;">'+ labelsForMps.join('<br>') +'</div>'
          let Knot ='<div title="Click to convert speed from Knot to Mps" style="position:absolute; cursor:pointer;">'+ labelsForKnot.join('<br>') +'</div>'
          control._container.classList.remove('legend-container')
          control._container.innerHTML = Knot
          control._container.addEventListener('click',function(e){
              if(flag==0)
                {
                  control._container.innerHTML=Mps
                  flag=1
                }
              else{
                control._container.innerHTML=Knot
                  flag=0
              }
          })
      }})
    },
    setupControls () {
      this.controls.forEach(control => control.addTo(this.map))
      this.setUpLegend()
      this.$emit('controlsReady')
    },
    center (longitude, latitude, zoomLevel) {
      this.map.setView(new L.LatLng(latitude, longitude), zoomLevel || 12)
    },
    removeLayer (layer) {
      if (!layer) return

      this.overlayLayersControl.removeLayer(layer)
      // If it was visible remove it from map
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer)
      }
      this.checkOverlayLayersControlVisibility()
    },
    addLayer (layer, name) {
      if (layer && !this.map.hasLayer(layer)) {
        // Check if layer is visible by default
        let visible = true
        if (layer.options.hasOwnProperty('visible')) {
          visible = layer.options.visible
        }
        if (visible) {
          this.map.addLayer(layer)
        }
        this.overlayLayersControl.addOverlay(layer, name)
        this.checkOverlayLayersControlVisibility()
      }
      return layer
    },
    checkOverlayLayersControlVisibility () {
      // Hidden while nothing has been loaded, default state
      this.overlayLayersControl.getContainer().style.visibility = 'hidden'
      this.overlayLayersControl._layers.forEach(_ => {
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
