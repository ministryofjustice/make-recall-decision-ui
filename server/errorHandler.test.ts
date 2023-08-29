import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './routes/testutils/appSetup'

jest.mock('./data/makeDecisionApiClient')

let app: Express

beforeEach(() => {
  app = appWithAllRoutes()
})

describe('Error pages', () => {
  it('should render 404 page', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service')
      })
  })
})
