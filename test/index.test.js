import logger from 'loglevel'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import 'jsdom-global/register'
import fetch from 'isomorphic-fetch'
import jQuery from 'jquery'
import { weacast } from '../src'

window.fetch = fetch
window.jQuery = window.$ = jQuery
global.jQuery = global.$ = jQuery
console.log(jQuery)

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
