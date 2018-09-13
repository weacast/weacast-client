import L from 'leaflet'
import chroma from 'chroma-js'
import { ForecastLayer } from './forecast-layer'
import * as PIXI from 'pixi.js'
import 'leaflet-pixi-overlay'

window.chroma = chroma

let ScalarLayer = ForecastLayer.extend({

  initialize (api, options) {
    // Merge options with default for undefined ones
    this.options = Object.assign({
      interpolate: true,
      colorMap: 'OrRd',
      opacity: 0.75
    }, options)
    // Create empty PIXI container
    this.pixiContainer = new PIXI.Container()
    // Create the PIXI overlay
    let layer = L.pixiOverlay(utils => this.drawScalarGrid(utils), this.pixiContainer, {
      autoPreventDefault: false
    })
    ForecastLayer.prototype.initialize.call(this, api, layer, options)
  },

  drawScalarGrid (utils) {
    // If no data return
    if (!this.field.zs) return 
    // Retrive utils objects
    let renderer = utils.getRenderer()
    let container = this.pixiContainer
    // It the PIXI container is null then build the grid
    if (this.pixiContainer.children.length === 0) {
      const yULCorner = this.field.yllCorner + (this.field.cellYSize * this.field.nRows)
      for (let i = 0; i < this.field.nCols; i++) {
        for (let j = 0; j < this.field.nRows; j++) {
          let x = this.field.xllCorner + i * this.field.cellXSize
          let y = yULCorner - j * this.field.cellYSize
          let xCell = this.field.xllCorner + i * this.field.cellXSize - (this.field.cellXSize / 2)
          let yCell = yULCorner - (j * this.field.cellYSize) - (this.field.cellYSize / 2)
          let minCell = utils.latLngToLayerPoint([yCell, xCell])
          let maxCell = utils.latLngToLayerPoint([yCell + this.field.cellYSize, xCell + this.field.cellXSize])
          let cell = new PIXI.Graphics()
          let cellValue = this.field.zs[(j * this.field.nCols) + i]    
          cell.beginFill(parseInt(this.getColor(cellValue).substring(1), 16), 0.50)
          cell.drawRect(minCell.x, minCell.y, maxCell.x - minCell.x, maxCell.y - minCell.y)
          cell.endFill()
          container.addChild(cell)
        }
      }
    }
    renderer.render(container)
  },

  getColor (value) {
    let entry = _.find(this.colorMap, colorMapEntry => { return colorMapEntry.value > value })
    if (entry) return entry.color
    return _.last(this.colorMap).color
  },

  getColorMap () {
    let colorMap = []
    let colors = chroma.brewer[this.options.colorMap]
    //[min, max] = this.options.color.domain()
    for (let i = 0; i < colors.length; i++) {
      colorMap.push({
        value: this.minValue + i * (this.maxValue - this.minValue) / colors.length,
        color: colors[i]
      })
    }
    return colorMap
  },

  setData (data) {
    this.minValue = data[0].minValue
    this.maxValue = data[0].maxValue
    this.colorMap = this.getColorMap()
    this.field.zs = data[0].data
    this.pixiContainer.removeChildren()
    this._baseLayer.redraw()
    ForecastLayer.prototype.setData.call(this, data)
  },

  setForecastModel (model) {
    // Format in leaflet-canvaslayer-field layer data model
    this.field = {
      nCols: model.size[0],
      nRows: model.size[1],
      xllCorner: model.bounds[0],
      yllCorner: model.bounds[1],
      cellXSize: model.resolution[0],
      cellYSize: model.resolution[1]
    }
    ForecastLayer.prototype.setForecastModel.call(this, model)
  }
})

L.Weacast.ScalarLayer = ScalarLayer
export { ScalarLayer }
