import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './routes/testutils/appSetup'
// import { getPersonsByCrn } from './data/makeDecisionApiClient'

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
        expect(res.text).toContain('Page not found')
      })
  })

  // TODO fix test to work with search by name
  // it('should render server error page', () => {
  //   const apiError = { status: 500 }
  //   ;(getPersonsByCrn as jest.Mock).mockRejectedValue(apiError)
  //   return request(appWithAllRoutes())
  //     .get('/search-results-by-crn?crn=123')
  //     .expect(500)
  //     .expect('Content-Type', /html/)
  //     .expect(res => {
  //       expect(res.text).toContain('Sorry, there is a problem with the service')
  //     })
  // })
})
