import { randomUUID } from 'node:crypto'
import {
  determinePpudEstablishment,
  NOMIS_ESTABLISHMENT_OUT,
  NOMIS_ESTABLISHMENT_TRANSFER,
  PPUD_ESTABLISHMENT_NOT_APPLICABLE,
} from './determinePpudEstablishment'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { establishmentMappings, offenderMovements, searchForPrisonOffender } from '../../../data/makeDecisionApiClient'
import { EstablishmentMap } from '../../../@types/make-recall-decision-api/models/prison-api/EstablishmentMap'
import { OffenderMovement } from '../../../@types/make-recall-decision-api/models/prison-api/OffenderMovement'
import { PrisonOffenderSearchResponse } from '../../../@types/make-recall-decision-api/models/PrisonOffenderSearchResponse'

const RECOMMENDATION_TEMPLATE: RecommendationResponse = {
  id: 123,
  prisonOffender: {
    image: 'string',
    locationDescription: 'string',
    bookingNo: 'string',
    facialImageId: 42,
    firstName: 'string',
    middleName: 'string',
    lastName: 'string',
    dateOfBirth: 'string',
    agencyId: 'string',
    agencyDescription: 'string',
    status: 'string',
    gender: 'string',
    ethnicity: 'string',
    cro: 'string',
    pnc: 'string',
  },
  personOnProbation: {},
}
const OFFENDER_MOVEMENT_TEMPLATE: OffenderMovement = {
  nomisId: 'string',
  movementType: 'string',
  movementTypeDescription: 'string',
  fromAgency: 'string',
  fromAgencyDescription: 'string',
  toAgency: 'string',
  toAgencyDescription: 'string',
  movementDateTime: new Date(),
}
const PRISON_OFFENDER_TEMPLATE: PrisonOffenderSearchResponse = {
  locationDescription: 'string',
  bookingNo: 'string',
  facialImageId: 42,
  firstName: 'string',
  middleName: 'string',
  lastName: 'string',
  dateOfBirth: 'string',
  agencyId: 'string',
  agencyDescription: 'string',
  status: 'string',
  physicalAttributes: {
    gender: 'string',
    ethnicity: 'string',
  },
  identifiers: [],
  image: 'string',
}
const TOKEN = 'token'

jest.mock('../../../data/makeDecisionApiClient')

describe('determinePpudEstablishment', () => {
  it('maps null to blank', async () => {
    const recommendation = RECOMMENDATION_TEMPLATE
    recommendation.prisonOffender.agencyId = null
    const ppudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(ppudEstablishment).toEqual('')
  })

  it('maps undefined to blank', async () => {
    const recommendation = RECOMMENDATION_TEMPLATE
    recommendation.prisonOffender.agencyId = undefined
    const ppudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(ppudEstablishment).toEqual('')
  })

  it('maps blank to blank', async () => {
    const recommendation = RECOMMENDATION_TEMPLATE
    recommendation.prisonOffender.agencyId = ''
    const ppudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(ppudEstablishment).toEqual('')
  })

  it('maps OUT to Not Applicable', async () => {
    const recommendation = RECOMMENDATION_TEMPLATE
    recommendation.prisonOffender.agencyId = NOMIS_ESTABLISHMENT_OUT
    const ppudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(ppudEstablishment).toEqual(PPUD_ESTABLISHMENT_NOT_APPLICABLE)
  })

  it('maps known prison value', async () => {
    const nomisAgencyId = randomUUID()
    const expectedPpudEstablishment = randomUUID()

    const recommendation = RECOMMENDATION_TEMPLATE
    recommendation.prisonOffender.agencyId = nomisAgencyId

    const establishmentMap: EstablishmentMap = new Map()
    establishmentMap.set(nomisAgencyId, expectedPpudEstablishment)
    establishmentMap.set(randomUUID(), randomUUID())
    establishmentMap.set(randomUUID(), randomUUID())
    ;(establishmentMappings as jest.Mock).mockReturnValueOnce(establishmentMap)

    const actualPpudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(actualPpudEstablishment).toEqual(expectedPpudEstablishment)
    expect(establishmentMappings).toHaveBeenCalledWith(TOKEN)
  })

  it('maps unknown prison value to blank', async () => {
    const nomisAgencyId = randomUUID()

    const recommendation = RECOMMENDATION_TEMPLATE
    recommendation.prisonOffender.agencyId = nomisAgencyId

    const establishmentMap: EstablishmentMap = new Map()
    establishmentMap.set(randomUUID(), randomUUID())
    establishmentMap.set(randomUUID(), randomUUID())
    ;(establishmentMappings as jest.Mock).mockReturnValueOnce(establishmentMap)

    const actualPpudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(actualPpudEstablishment).toEqual('')
    expect(establishmentMappings).toHaveBeenCalledWith(TOKEN)
  })

  it('maps TRN value to latest movement if it is a transfer', async () => {
    const nomisAgencyId = randomUUID()
    const expectedPpudEstablishment = randomUUID()

    const recommendation = RECOMMENDATION_TEMPLATE
    recommendation.personOnProbation.nomsNumber = randomUUID()
    recommendation.prisonOffender.agencyId = NOMIS_ESTABLISHMENT_TRANSFER

    const firstOffenderMovement = OFFENDER_MOVEMENT_TEMPLATE
    const lastOffenderMovement = OFFENDER_MOVEMENT_TEMPLATE
    lastOffenderMovement.movementType = NOMIS_ESTABLISHMENT_TRANSFER
    lastOffenderMovement.toAgency = nomisAgencyId
    lastOffenderMovement.movementDateTime.setDate(firstOffenderMovement.movementDateTime.getDate() + 1)
    ;(offenderMovements as jest.Mock).mockReturnValueOnce([firstOffenderMovement, lastOffenderMovement])

    const establishmentMap: EstablishmentMap = new Map()
    establishmentMap.set(nomisAgencyId, expectedPpudEstablishment)
    establishmentMap.set(randomUUID(), randomUUID())
    establishmentMap.set(randomUUID(), randomUUID())
    ;(establishmentMappings as jest.Mock).mockReturnValueOnce(establishmentMap)

    const actualPpudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(actualPpudEstablishment).toEqual(expectedPpudEstablishment)
    expect(offenderMovements).toHaveBeenCalledWith(TOKEN, recommendation.personOnProbation.nomsNumber)
    expect(establishmentMappings).toHaveBeenCalledWith(TOKEN)
  })

  it('handles TRN value when latest movement is not transfer and offender details now have agency', async () => {
    const nomisAgencyId = randomUUID()
    const expectedPpudEstablishment = randomUUID()

    const recommendation = RECOMMENDATION_TEMPLATE
    const nomisId = randomUUID()
    recommendation.personOnProbation.nomsNumber = nomisId
    recommendation.prisonOffender.agencyId = NOMIS_ESTABLISHMENT_TRANSFER

    const firstOffenderMovement = OFFENDER_MOVEMENT_TEMPLATE
    const lastOffenderMovement = OFFENDER_MOVEMENT_TEMPLATE
    lastOffenderMovement.movementType = randomUUID()
    lastOffenderMovement.movementDateTime.setDate(firstOffenderMovement.movementDateTime.getDate() + 1)
    ;(offenderMovements as jest.Mock).mockReturnValueOnce([firstOffenderMovement, lastOffenderMovement])

    const updatedPrisonOffender = PRISON_OFFENDER_TEMPLATE
    updatedPrisonOffender.agencyId = nomisAgencyId
    ;(searchForPrisonOffender as jest.Mock).mockReturnValueOnce(updatedPrisonOffender)

    const establishmentMap: EstablishmentMap = new Map()
    establishmentMap.set(nomisAgencyId, expectedPpudEstablishment)
    establishmentMap.set(randomUUID(), randomUUID())
    establishmentMap.set(randomUUID(), randomUUID())
    ;(establishmentMappings as jest.Mock).mockReturnValueOnce(establishmentMap)

    const actualPpudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(actualPpudEstablishment).toEqual(expectedPpudEstablishment)
    expect(offenderMovements).toHaveBeenCalledWith(TOKEN, nomisId)
    expect(searchForPrisonOffender).toHaveBeenCalledWith(TOKEN, nomisId)
    expect(establishmentMappings).toHaveBeenCalledWith(TOKEN)
  })

  it('returns blank when agency is TRN, latest movement is not transfer and offender details are still TRN', async () => {
    const recommendation = RECOMMENDATION_TEMPLATE
    const nomisId = randomUUID()
    recommendation.personOnProbation.nomsNumber = nomisId
    recommendation.prisonOffender.agencyId = NOMIS_ESTABLISHMENT_TRANSFER

    const firstOffenderMovement = OFFENDER_MOVEMENT_TEMPLATE
    const lastOffenderMovement = OFFENDER_MOVEMENT_TEMPLATE
    lastOffenderMovement.movementType = randomUUID()
    lastOffenderMovement.movementDateTime.setDate(firstOffenderMovement.movementDateTime.getDate() + 1)
    ;(offenderMovements as jest.Mock).mockReturnValueOnce([firstOffenderMovement, lastOffenderMovement])

    const updatedPrisonOffender = PRISON_OFFENDER_TEMPLATE
    updatedPrisonOffender.agencyId = NOMIS_ESTABLISHMENT_TRANSFER
    ;(searchForPrisonOffender as jest.Mock).mockReturnValueOnce(updatedPrisonOffender)

    const actualPpudEstablishment = await determinePpudEstablishment(recommendation, TOKEN)

    expect(actualPpudEstablishment).toEqual('')
    expect(offenderMovements).toHaveBeenCalledWith(TOKEN, nomisId)
    expect(searchForPrisonOffender).toHaveBeenCalledWith(TOKEN, nomisId)
  })
})
