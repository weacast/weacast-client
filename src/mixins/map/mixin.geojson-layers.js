import L from 'leaflet'
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js'

import store from '../store'

let geojsonLayersMixin = {
  methods: {
    addGeoJson (geojson, geojsonOptions) {
      return this.addLayer(L.geoJson(geojson, geojsonOptions || this.getGeoJsonOptions()))
    },
    addTimedGeoJson (geojson, timeOptions, geojsonOptions) {
      return this.addLayer(L.timeDimension.layer.geoJson(L.geoJson(geojson, geojsonOptions || this.getGeoJsonOptions()), timeOptions))
    },
    getGeoJsonOptions () {
      let geojsonOptions = {
        onEachFeature: (feature, layer) => {
          // Custom defined function in component ?
          if (typeof this.getFeaturePopup === 'function') {
            layer.bindPopup(this.getFeaturePopup(feature, layer))
          }
          // Configured or default style
          else if (feature.properties) {
            layer.bindPopup(Object.keys(feature.properties).map(function (k) {
              return k + ': ' + feature.properties[k]
            }).join('<br />'), {
              maxHeight: 200
            })
          }
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

      return geojsonOptions
    }
  }
}

store.set('geojsonLayers', geojsonLayersMixin)

export default geojsonLayersMixin
