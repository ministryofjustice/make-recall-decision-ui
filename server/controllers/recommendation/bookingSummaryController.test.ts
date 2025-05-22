import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import bookingSummaryController from './bookingSummaryController'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

const STATUSES_TEMPLATE = [
  {
    name: 'SPO_SIGNED',
    active: true,
    created: '2023-11-13T09:49:31.361Z',
  },
  {
    name: 'ACO_SIGNED',
    active: true,
    created: '2023-11-13T09:49:31.361Z',
  },
  {
    name: 'PO_RECALL_CONSULT_SPO',
    active: true,
    created: '2023-11-13T09:49:31.361Z',
  },
  {
    name: 'SENT_TO_PPCS',
    active: true,
    created: '2023-11-13T09:49:31.777Z',
  },
]

const RECOMMENDATION_TEMPLATE = {
  nomisIndexOffence: {
    allOptions: [
      {
        bookingId: 13,
        courtDescription: 'Blackburn County Court',
        offenceCode: 'SA12345',
        offenceDescription: 'Attack / assault / batter a member of the public',
        offenceStatute: 'SA96',
        offenderChargeId: 3934369,
        sentenceDate: '2023-11-16',
        sentenceEndDate: '3022-11-15',
        sentenceStartDate: '2023-11-16',
        terms: [],
        releaseDate: '2025-11-16',
        licenceExpiryDate: '2025-11-17',
        releasingPrison: 'Broad Moor',
      },
    ],
    selected: 3934369,
  },
  currentRoshForPartA: {
    riskToChildren: 'LOW',
    riskToPublic: 'LOW',
    riskToKnownAdult: 'HIGH',
    riskToStaff: 'LOW',
    riskToPrisoners: 'LOW',
  },
  whoCompletedPartA: {
    name: 'john',
    email: 'john@me.com',
    telephone: '1234567',
    region: 'region B',
    localDeliveryUnit: 'who-completed-delivery-unit',
    isPersonProbationPractitionerForOffender: true,
  },
  practitionerForPartA: {
    name: 'jane',
    email: 'jane@me.com',
    telephone: '55555',
    region: 'region A',
    localDeliveryUnit: 'practitioner-delivery-unit',
  },
} as RecommendationResponse

describe('get', () => {
  it('load', async () => {
    const res = mockRes({
      locals: {
        statuses: STATUSES_TEMPLATE,
        recommendation: RECOMMENDATION_TEMPLATE,
      },
    })

    const next = mockNext()
    await bookingSummaryController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'bookingSummary' })
    expect(res.locals.offence).toEqual(RECOMMENDATION_TEMPLATE.nomisIndexOffence.allOptions[0])
    expect(res.locals.recallReceived).toEqual('2023-11-13T09:49:31.777Z')
    expect(res.locals.currentHighestRosh).toEqual('High')
    expect(res.locals.practitioner).toEqual({
      name: 'jane',
      email: 'jane@me.com',
      telephone: '55555',
      region: 'region A',
      localDeliveryUnit: 'practitioner-delivery-unit',
    })
    expect(res.locals.acoSigned).toEqual({
      name: 'ACO_SIGNED',
      active: true,
      created: '2023-11-13T09:49:31.361Z',
    })
    expect(res.locals.poRecallConsultSpo).toEqual({
      name: 'PO_RECALL_CONSULT_SPO',
      active: true,
      created: '2023-11-13T09:49:31.361Z',
    })

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookingSummary')
    expect(next).toHaveBeenCalled()
  })

  it('load - no practitioner', async () => {
    const res = mockRes({
      locals: {
        statuses: STATUSES_TEMPLATE,
        recommendation: { ...RECOMMENDATION_TEMPLATE, practitionerForPartA: undefined },
      },
    })

    const next = mockNext()
    await bookingSummaryController.get(mockReq(), res, next)

    expect(res.locals.practitioner).toEqual({
      name: 'john',
      email: 'john@me.com',
      telephone: '1234567',
      region: 'region B',
      localDeliveryUnit: 'who-completed-delivery-unit',
      isPersonProbationPractitionerForOffender: true,
    })
  })

  it('load - explicit received date', async () => {
    const res = mockRes({
      locals: {
        statuses: STATUSES_TEMPLATE,
        recommendation: {
          ...RECOMMENDATION_TEMPLATE,
          bookRecallToPpud: { receivedDateTime: '2023-11-13T09:49:31.999Z' },
        },
      },
    })

    const next = mockNext()
    await bookingSummaryController.get(mockReq(), res, next)

    expect(res.locals.recallReceived).toEqual('2023-11-13T09:49:31.999Z')
  })
})
