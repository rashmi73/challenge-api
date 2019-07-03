/*
 * E2E tests of health API
 */

// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

require('../../app-bootstrap')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../app')

const should = chai.should()
chai.use(chaiHttp)

describe('health API tests', () => {
  it('Check health successfully', async () => {
    const response = await chai.request(app)
      .get('/health')
    should.equal(response.status, 200)
    should.equal(response.body.checksRun >= 1, true)
  })
})