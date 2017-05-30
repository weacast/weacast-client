import L from 'leaflet'
import 'leaflet-filelayer'

import store from '../store'

let fileLayersMixin = {
  mounted () {
    // This one is used to add custom user layers
    let switchControl = L.control.layers([], [])
    this.controls.push(switchControl)

    let geojsonOptions = {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(Object.keys(feature.properties).map(function (k) {
          return k + ': ' + feature.properties[k]
        }).join('<br />'), {
          maxHeight: 200
        })
      },
      style: (feature) => {
        // Custom defined function in component ?
        if (typeof this.getFeatureStyle === 'function') {
          return this.getFeatureStyle(feature)
        }
        // Configured or default style
        else {
          return this.configuration.featureStyle || {
            opacity: 1,
            radius: 6,
            color: 'red',
            fillOpacity: 0.5,
            fillColor: 'green'
          }
        }
      },
      pointToLayer: (feature, latlng) => {
        // Custom defined function in component ?
        if (typeof this.getPointMarker === 'function') {
          return this.getPointMarker(feature, latlng)
        }
        // Configured or default style
        else {
          const markerStyle = this.configuration.pointStyle
          if (markerStyle) {
            let icon = markerStyle.icon
            // Parse icon options to get icon object if any
            if (icon) {
              icon = L[icon.type](icon.options)
              return L[markerStyle.type](latlng, { icon })
            }
            else {
              return L[markerStyle.type](latlng, markerStyle.options)
            }
          }
          else {
            return L.marker(latlng)
          }
        }
      }
    }

    L.Control.FileLayerLoad.LABEL = '<i class="material-icons">file_upload</i>'
    let fileControl = L.Control.fileLayerLoad({
      // Allows you to use a customized version of L.geoJson.
      // For example if you are using the Proj4Leaflet leaflet plugin,
      // you can pass L.Proj.geoJson and load the files into the
      // L.Proj.GeoJson instead of the L.geoJson.
      layer: L.geoJson,
      // See http://leafletjs.com/reference.html#geojson-options
      layerOptions: geojsonOptions,
      // Add to map after loading (default: true) ?
      addToMap: true,
      // File size limit in kb (default: 1024) ?
      fileSizeLimit: this.configuration.fileSizeLimit || 1024 * 1024,
      // Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
      formats: [
        '.geojson',
        '.kml'
      ]
    })
    this.controls.push(fileControl)
    this.$on('ready', _ => {
      // hidden while nothing has been loaded
      switchControl.getContainer().style.visibility = 'hidden'
      fileControl.loader.on('data:loaded', event => {
        // Remove any previous layer
        if (this.fileLayer) {
          switchControl.removeLayer(this.fileLayer)
          this.map.removeLayer(this.fileLayer)
        }
        switchControl.getContainer().style.visibility = 'visible'
        // Add to map layer switcher
        switchControl.addOverlay(event.layer, event.filename)
        // Keep track of layer
        this.fileLayer = event.layer
        this.$emit('fileLayerLoaded', this.fileLayer, event.filename)
      })
    })
  }
}

store.set('fileLayers', fileLayersMixin)

export default fileLayersMixin
