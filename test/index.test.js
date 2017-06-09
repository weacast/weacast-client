import logger from 'loglevel'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import 'jsdom-global/register'
import fetch from 'isomorphic-fetch'
// Importing the whole weacast module makes Leaflet time dimension fail due to jQuery not be defined
// The following workaround, although presented as working on the internet, does not help
// import jQuery from 'jquery'
// window.jQuery = window.$ = jQuery
// global.jQuery = global.$ = jQuery
// import { weacast } from '../src'
// For now simply testing the API
import weacast from '../src/api'

window.fetch = fetch

describe('weacast-client', () => {
  let app

  before(() => {
    chailint(chai, util)
    app = weacast()
  })

  it('is CommonJS compatible', () => {
    expect(typeof weacast).to.equal('function')
  })

  it('registers the forecasts service', () => {
    let service = app.getService('forecasts')
    expect(service).toExist()
  })

  it('registers the log options', () => {
    logger.info('This is a log test')
    expect(logger.getLevel()).to.equal(logger.levels.ERROR)
  })
})
