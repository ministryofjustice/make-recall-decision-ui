import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { searchForPrisonOffender, updateRecommendation } from '../../data/makeDecisionApiClient'
import checkBookingDetailsController from './checkBookingDetailsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue({
      locationDescription: 'Graceland',
    })

    const res = mockRes({
      locals: {
        recommendation: {
          id: '123',
          personOnProbation: {
            croNumber: '123X',
            nomsNumber: '567Y',
            surname: 'Mayer',
            dateOfBirth: '2001-01-01',
            mappa: {
              level: '1',
            },
          },
          whoCompletedPartA: {
            localDeliveryUnit: 'who-completed-delivery-unit',
            isPersonProbationPractitionerForOffender: false,
          },
          practitionerForPartA: {
            localDeliveryUnit: 'practitioner-delivery-unit',
          },
        },
        statuses: [
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
        ],
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()

    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(searchForPrisonOffender).toHaveBeenCalledWith('token', '567Y')

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: { xyz: 1 },
      recommendationId: '123',
      token: 'token',
      valuesToSave: { prisonApiLocationDescription: 'Graceland' },
    })

    expect(res.locals.page.id).toEqual('checkBookingDetails')
    expect(res.locals.custodialStatus).toEqual('Graceland')
    expect(res.locals.probationArea).toEqual('practitioner-delivery-unit')
    expect(res.locals.mappaLevel).toEqual('1')
    expect(res.locals.spoSigned).toEqual({
      name: 'SPO_SIGNED',
      active: true,
      created: '2023-11-13T09:49:31.361Z',
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
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/checkBookingDetails`)
    expect(next).toHaveBeenCalled()
  })

  it('load', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue({
      locationDescription: 'Graceland',
    })

    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: {
            croNumber: '123X',
            nomsNumber: '567Y',
            surname: 'Mayer',
            dateOfBirth: '2001-01-01',
            mappa: {
              level: '1',
            },
          },
          whoCompletedPartA: {
            localDeliveryUnit: 'who-completed-delivery-unit',
            isPersonProbationPractitionerForOffender: true,
          },
          practitionerForPartA: {
            localDeliveryUnit: 'practitioner-delivery-unit',
          },
        },
        statuses: [
          {
            name: 'SPO_SIGNED',
            active: true,
            created: '2023-11-13T09:49:31.361Z',
          },
        ],
      },
    })
    const next = mockNext()
    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(res.locals.probationArea).toEqual('who-completed-delivery-unit')
  })
})

describe('post', () => {
  it('book in ppud', async () => {
    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await checkBookingDetailsController.post(mockReq(), res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/check-booking-details`)

    expect(next).toHaveBeenCalled()
  })
})
