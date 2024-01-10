import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import editProbationAreaController from './editProbationAreaController'

jest.mock('../../data/makeDecisionApiClient')

const RECOMMENDATION_TEMPLATE = {
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
}

describe('get', () => {
  it('load', async () => {
    ;(ppudReferenceList as jest.Mock).mockResolvedValue({ values: ['one', 'two', 'three'] })

    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const res = mockRes({
      locals: {
        recommendation: RECOMMENDATION_TEMPLATE,
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()
    await editProbationAreaController.get(req, res, next)

    expect(ppudReferenceList).toHaveBeenCalledWith('token', 'probation-services')

    expect(res.locals.page).toEqual({ id: 'editProbationArea' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editProbationArea')
    expect(res.locals.ppudProbationAreas).toEqual([
      { text: 'Select probation area', value: '' },
      { text: 'one', value: 'one' },
      { text: 'two', value: 'two' },
      { text: 'three', value: 'three' },
    ])
    expect(res.locals.partAProbationArea).toEqual('practitioner-delivery-unit')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        probationArea: 'blue',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editProbationAreaController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          probationArea: 'blue',
        },
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with invalid data', async () => {
    const basePath = `/recommendations/1/`
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editProbationAreaController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingProbationArea',
        invalidParts: undefined,
        href: '#probationArea',
        name: 'probationArea',
        text: 'Select a probation area',
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
