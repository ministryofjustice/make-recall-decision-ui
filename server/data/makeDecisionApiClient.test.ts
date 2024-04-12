import nock from 'nock'
import { searchForPrisonOffender } from './makeDecisionApiClient'
import config from '../config'

describe('makeDecisionApiClient', () => {
  let fakeMakeRecallDecisionApi: nock.Scope

  beforeEach(() => {
    fakeMakeRecallDecisionApi = nock(config.apis.makeRecallDecisionApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('searchForPrisonOffender', () => {
    it('should return undefined if NOMIS ID is null', async () => {
      const nomisId: string = null
      const result = await searchForPrisonOffender('some_token', nomisId)
      expect(result).toBeUndefined()
    })

    it('should return undefined if NOMIS ID is undefined', async () => {
      const nomisId: string = undefined
      const result = await searchForPrisonOffender('some_token', nomisId)
      expect(result).toBeUndefined()
    })

    it('should return undefined if NOMIS ID is empty', async () => {
      const nomisId = ''
      const result = await searchForPrisonOffender('some_token', nomisId)
      expect(result).toBeUndefined()
    })

    it('should call search API if NOMIS ID is provided', async () => {
      const nomisId = 'ABC123'
      const response = { data: 'data' }

      fakeMakeRecallDecisionApi.post('/prison-offender-search').reply(200, response)

      const result = await searchForPrisonOffender('some_token', nomisId)
      expect(result).toEqual(response)
    })
  })
})
