import L from 'leaflet'
import 'leaflet-legend/leaflet-legend.js'
import 'leaflet-legend/leaflet-legend.css'
import store from '../store'

let legendMixin = {
   methods: {
    setUpLegend(colors,min,max){ //set up legend menu to map speed with color
        this.controls.forEach(control => {if(control.options.controlButton && control.options.controlButton.title == 'Legend'){
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
        labelsForKnot.push('<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background:' + colors[i]+ '">'+ (mpsToKnot(colorIndexForSpeed.indexOf(i))).toFixed(0) +'</span> ')
         }
        let flag = 0
        let Mps ='<div title="Click to convert speed from Mps to Knot" style="position:absolute; cursor:pointer;">'+ labelsForMps.join('<br>') +'</div>'
        let Knot ='<div title="Click to convert speed from Knot to Mps" style="position:absolute; cursor:pointer;">'+ labelsForKnot.join('<br>') +'</div>'
        control._container.classList.remove('legend-container')
        control._container.innerHTML = Knot
        control._container.addEventListener('click',function(e){
          if(flag==0)
            {
              control._container.innerHTML = Mps
              flag=1
            }
          else{
            control._container.innerHTML = Knot
            flag=0
          }
        })
       }})
     }
  },
  mounted () {
    let legendControl = new L.Control.Legend({ 
        position: 'topleft',
        collapsed: true,
        controlButton: {
            title: "Legend"
        }
     })
    this.controls.push(legendControl)          
    this.map.on('layeradd', event => {
      if(event.layer._baseLayer){
        let colors = event.layer._baseLayer.options.colorScale
        let min = event.layer._baseLayer.options.minVelocity
        let max = event.layer._baseLayer.options.maxVelocity
        if(colors && min && max){
        this.setUpLegend(colors,min,max)
        }
      }
    })
  }
}

store.set('legend', legendMixin)

export default legendMixin
