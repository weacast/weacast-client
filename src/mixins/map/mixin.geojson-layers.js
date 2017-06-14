import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-timedimension'

import store from '../store'

let geojsonLayersMixin = {
  methods: {
    addGeoJson (geojson, name, geojsonOptions) {
      return this.addLayer(L.geoJson(geojson, geojsonOptions || this.getGeoJsonOptions()), name)
    },
    addGeoJsonCluster (geojson, name, geojsonOptions) {
      let cluster = L.markerClusterGroup()
      cluster.addLayer(L.geoJson(geojson, geojsonOptions || this.getGeoJsonOptions()))
      return this.addLayer(cluster, name)
    },
    addTimedGeoJson (geojson, name, timeOptions, geojsonOptions) {
      return this.addLayer(L.timeDimension.layer.geoJson(L.geoJson(geojson, geojsonOptions || this.getGeoJsonOptions()), timeOptions), name)
    },
    getGeoJsonOptions () {
      let geojsonOptions = {
        onEachFeature: (feature, layer) => {
          const featureStyle = this.configuration.featureStyle
          // Custom defined function in component ?
          if (typeof this.getFeaturePopup === 'function') {
            layer.bindPopup(this.getFeaturePopup(feature, layer))
          } else if (feature.properties) {
            // Default content
            const borderStyle = ' style="border: 1px solid black; border-collapse: collapse;"'
            let html = '<table' + borderStyle + '>'
            html += '<tr' + borderStyle + '><th' + borderStyle + '>Property</th><th>Value</th></tr>'
            let properties = Object.keys(feature.properties)
            // Custom list given ?
            if (featureStyle && featureStyle.popup) {
              if (featureStyle.popup.properties) {
                properties = featureStyle.popup.properties
              }
              if (featureStyle.popup.excludedProperties) {
                properties = properties.filter(property => !featureStyle.popup.excludedProperties.includes(property))
              }
            }
            html += properties
            .filter(k => feature.properties[k] !== null && feature.properties[k] !== undefined)
            .map(k => '<tr style="border: 1px solid black; border-collapse: collapse;"><th' + borderStyle + '>' + k + '</th><th>' + feature.properties[k] + '</th></tr>')
            .join('')
            html += '</table>'
            // Configured or default style
            if (featureStyle && featureStyle.popup && featureStyle.popup.options) {
              layer.bindPopup(html, featureStyle.popup.options)
            } else {
              layer.bindPopup(html, {
                maxHeight: 400,
                maxWidth: 400
              })
            }
          }
          // Custom defined function in component ?
          if (typeof this.getFeatureTooltip === 'function') {
            layer.bindTooltip(this.getFeatureTooltip(feature, layer))
          } else if (featureStyle && featureStyle.tooltip && featureStyle.tooltip.property && feature.properties) {
            let tooltip = feature.properties[featureStyle.tooltip.property]
            if (tooltip) {
              layer.bindTooltip(tooltip, featureStyle.tooltip.options || { permanent: true })
            }
          }
        },
        style: (feature) => {
          // Custom defined function in component ?
          if (typeof this.getFeatureStyle === 'function') {
            return this.getFeatureStyle(feature)
          } else {
            // Configured or default style
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
          } else {
            // Configured or default style
            const markerStyle = this.configuration.pointStyle
            if (markerStyle) {
              let icon = markerStyle.icon
              // Parse icon options to get icon object if any
              if (icon) {
                icon = L[icon.type](icon.options)
                return L[markerStyle.type](latlng, { icon })
              } else {
                return L[markerStyle.type](latlng, markerStyle.options)
              }
            } else {
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
