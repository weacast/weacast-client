import { ForecastLayer, FlowLayer, HeatLayer } from './layers'
import weacast from './api'
import MixinStore from './mixins/store'
import mixins from './mixins'
import EventBus from './event-bus'
// A shorter version of all of this should be the following
/*
export * as hooks from './hooks'
*/
// However for now we face a bug in babel so that transform-runtime with export * from 'x' generates import statements in transpiled code
// Tracked here : https://github.com/babel/babel/issues/2877
import { log, emit } from './hooks'

export { ForecastLayer, FlowLayer, HeatLayer }
export { MixinStore }
export { mixins }
export { weacast }
export { EventBus }
export let hooks = { log, emit }
