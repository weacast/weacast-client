import L from 'leaflet'
import 'leaflet-legend/leaflet-legend.js'
import 'leaflet-legend/leaflet-legend.css'

import store from '../store'

let legendMixin = {
  mounted () {
    let legendControl = new L.Control.Legend({ 
        position: 'topleft',
        collapsed: true,
        controlButton: {
            title: "Legend"
        }
     })
    this.controls.push(legendControl)
  }
}

store.set('legend', legendMixin)

export default legendMixin
