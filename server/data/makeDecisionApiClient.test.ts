import nock from 'nock'
import { randomUUID } from 'node:crypto'
import { establishmentMappings, offenderMovements, searchForPrisonOffender } from './makeDecisionApiClient'
import config from '../config'
import { OffenderMovementResponse } from '../@types/make-recall-decision-api/models/prison-api/OffenderMovementResponse'

const TOKEN = 'some_token'

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
      const result = await searchForPrisonOffender(TOKEN, nomisId)
      expect(result).toBeUndefined()
    })

    it('should return undefined if NOMIS ID is undefined', async () => {
      const nomisId: string = undefined
      const result = await searchForPrisonOffender(TOKEN, nomisId)
      expect(result).toBeUndefined()
    })

    it('should return undefined if NOMIS ID is empty', async () => {
      const nomisId = ''
      const result = await searchForPrisonOffender(TOKEN, nomisId)
      expect(result).toBeUndefined()
    })

    it('should call search API if NOMIS ID is provided', async () => {
      const nomisId = 'ABC123'
      const response = { data: 'data' }

      fakeMakeRecallDecisionApi.post('/prison-offender-search').reply(200, response)

      const result = await searchForPrisonOffender(TOKEN, nomisId)
      expect(result).toEqual(response)
    })
  })

  describe('offenderMovements', () => {
    it('retrieves offender movements', async () => {
      const nomisId = randomUUID()
      const offenderMovementResponses: OffenderMovementResponse[] = [
        randomOffenderMovementResponse(),
        randomOffenderMovementResponse(),
      ]
      fakeMakeRecallDecisionApi.get(`/offenders/${nomisId}/movements`).reply(200, offenderMovementResponses)
      const expectedOffenderMovements = offenderMovementResponses.map(response => {
        return {
          ...response,
          movementDateTime: new Date(response.movementDateTime),
        }
      })

      const actualOffenderMovements = await offenderMovements(TOKEN, nomisId)

      expect(actualOffenderMovements).toEqual(expectedOffenderMovements)
    })

    function randomOffenderMovementResponse(): OffenderMovementResponse {
      return {
        fromAgency: randomUUID(),
        fromAgencyDescription: randomUUID(),
        movementDateTime: new Date().toISOString(),
        movementType: randomUUID(),
        movementTypeDescription: randomUUID(),
        nomisId: randomUUID(),
        toAgency: randomUUID(),
        toAgencyDescription: randomUUID(),
      }
    }
  })

  describe('establishmentMappings', () => {
    it('retrieves establishment mappings', async () => {
      const key = randomUUID()
      const value = randomUUID()
      const expectedMappings = new Map<string, string>()
      expectedMappings.set(key, value)

      const mappingsResponse: { [index: string]: string } = {}
      mappingsResponse[key] = value
      fakeMakeRecallDecisionApi.get('/establishment-mappings').reply(200, mappingsResponse)

      const actualMappings = await establishmentMappings(TOKEN)

      expect(actualMappings).toEqual(expectedMappings)
    })
  })
})
