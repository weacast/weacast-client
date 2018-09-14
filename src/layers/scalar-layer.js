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
      opacity: 0.25,
      mesh: true
    }, options)
    // Create empty PIXI container
    if (this.options.mesh) {
      var _pixiGlCore2 = PIXI.glCore
      PIXI.mesh.MeshRenderer.prototype.onContextChange = function onContextChange() {
        var gl = this.renderer.gl
        this.shader = new PIXI.Shader(gl, 
          'attribute vec2 aVertexPosition;\n' +
          'attribute vec3 aVertexColor;\n' +
          'uniform mat3 projectionMatrix;\n' +
          'uniform mat3 translationMatrix;\n' +
          'varying vec3 vColor;\n' +
          'void main(void)\n{\n' +
          '  vColor = aVertexColor;\n' +
          '  gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n' +
          '}\n',
          'precision mediump float;' +
          'varying vec3 vColor;\n' +
          'uniform float alpha;\n' +
          'void main(void)\n{\n' +
          '  gl_FragColor.rgb = vec3(vColor[0]*alpha, vColor[1]*alpha, vColor[2]*alpha);\n' +
          '  gl_FragColor.a = alpha;\n' +
          '}\n'
        )
      }
      PIXI.mesh.MeshRenderer.prototype.render = function render(mesh) {
        var renderer = this.renderer;
        var gl = renderer.gl
        var glData = mesh._glDatas[renderer.CONTEXT_UID]
        if (!glData) {
          renderer.bindVao(null)
          glData = {
            shader: this.shader,
            vertexBuffer: _pixiGlCore2.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
            colorBuffer: _pixiGlCore2.GLBuffer.createVertexBuffer(gl, mesh.colors, gl.STREAM_DRAW),
            indexBuffer: _pixiGlCore2.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW)
          };
          // build the vao object that will render..
          glData.vao = new _pixiGlCore2.VertexArrayObject(gl)
            .addIndex(glData.indexBuffer)
            .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 4 * 2, 0)
            .addAttribute(glData.colorBuffer, glData.shader.attributes.aVertexColor, gl.FLOAT, false, 4 * 3, 0)
          mesh._glDatas[renderer.CONTEXT_UID] = glData
        }
        renderer.bindVao(glData.vao)
        renderer.bindShader(glData.shader)
        glData.shader.uniforms.alpha = mesh.alpha
        glData.shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true)
        glData.vao.draw(gl.TRIANGLES, mesh.indices.length, 0)
      }
    }
    this.pixiContainer = new PIXI.Container()
    // Create the PIXI overlay
    let layer = L.pixiOverlay(utils => this.options.mesh ? this.drawScalarMesh(utils) : this.drawScalarGrid(utils), this.pixiContainer, {
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
          let xCell = x - (this.field.cellXSize / 2)
          let yCell = y - (this.field.cellYSize / 2)
          let minCell = utils.latLngToLayerPoint([yCell, xCell])
          let maxCell = utils.latLngToLayerPoint([yCell + this.field.cellYSize, xCell + this.field.cellXSize])
          let cell = new PIXI.Graphics()
          let cellValue = this.field.zs[(j * this.field.nCols) + i]    
          cell.beginFill(parseInt(this.getColor(cellValue).substring(1), 16), this.options.opacity)
          cell.drawRect(minCell.x, minCell.y, maxCell.x - minCell.x, maxCell.y - minCell.y)
          cell.endFill()
          container.addChild(cell)
        }
      }
    }
    renderer.render(container)
  },

  drawScalarMesh (utils) {
    // If no data return
    if (!this.field.zs) return 
    // Retrive utils objects
    let renderer = utils.getRenderer()
    let container = this.pixiContainer
    // It the PIXI container is null then build the grid
    if (this.pixiContainer.children.length === 0) {
      renderer.gl.blendFunc(renderer.gl.ONE, renderer.gl.ZERO)
      const yULCorner = this.field.yllCorner + (this.field.cellYSize * this.field.nRows)
      let vertices = []
      let colors = []
      let indices = []
      for (let i = 0; i < this.field.nCols; i++) {
        for (let j = 0; j < this.field.nRows; j++) {
          let x = this.field.xllCorner + i * this.field.cellXSize
          let y = yULCorner - j * this.field.cellYSize
          let pos = utils.latLngToLayerPoint([y, x])
          vertices.push(pos.x)
          vertices.push(pos.y)
          let cellValue = this.field.zs[(j * this.field.nCols) + i]    
          let rgb = PIXI.utils.hex2rgb(parseInt(this.getColor(cellValue).substring(1), 16))
          colors.push(rgb[0])
          colors.push(rgb[1])
          colors.push(rgb[2])
          if (i < (this.field.nCols -1) && j < (this.field.nRows - 1)) {
            let index00 = (j * this.field.nCols) + i
            let index01 = index00 + 1
            let index10 = index00 + this.field.nCols
            let index11 = index10 + 1
            indices.push(index00)
            indices.push(index10)
            indices.push(index01)
            indices.push(index01)
            indices.push(index10)
            indices.push(index11)
          }
        }
      }
      let mesh = new PIXI.mesh.Mesh(null, new Float32Array(vertices), null, new Uint16Array(indices), PIXI.mesh.Mesh.DRAW_MODES.TRIANGLES)
      mesh.colors = new Float32Array(colors)
      mesh.alpha = this.options.opacity
			container.addChild(mesh)      
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
