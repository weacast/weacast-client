import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import 'jsdom-global/register'
import fetch from 'isomorphic-fetch'
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
})
