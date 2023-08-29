import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import practitionerForPartAController from './practitionerForPartAController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await practitionerForPartAController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'practitionerForPartA' })
    expect(res.locals.inputDisplayValues.name).not.toBeDefined()
    expect(res.locals.inputDisplayValues.email).not.toBeDefined()
    expect(res.locals.inputDisplayValues.telephone).not.toBeDefined()
    expect(res.locals.inputDisplayValues.region).not.toBeDefined()
    expect(res.locals.inputDisplayValues.localDeliveryUnit).not.toBeDefined()
    expect(res.locals.inputDisplayValues.isPersonProbationPractitionerForOffender).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/practitionerForPartA')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          practitionerForPartA: {
            name: 'dudette',
            email: 'dudette@me.com',
            telephone: '55555',
            region: 'region A',
            localDeliveryUnit: 'here',
            isPersonProbationPractitionerForOffender: true,
          },
        },
      },
    })

    await practitionerForPartAController.get(mockReq(), res, mockNext())

    expect(res.locals.inputDisplayValues.name).toEqual('dudette')
    expect(res.locals.inputDisplayValues.email).toEqual('dudette@me.com')
    expect(res.locals.inputDisplayValues.telephone).toEqual('55555')
    expect(res.locals.inputDisplayValues.region).toEqual('region A')
    expect(res.locals.inputDisplayValues.localDeliveryUnit).toEqual('here')
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: { val: 'some error' },
        unsavedValues: {
          name: 'test',
          email: 'test@here.com',
          telephone: '555555555555',
          region: 'place B',
          localDeliveryUnit: 'some place',
          isPersonProbationPractitionerForOffender: 'NO',
        },
        recommendation: {
          whoCompletedPartA: {
            name: 'dudette',
            email: 'dudette@me.com',
            telephone: '123456',
            region: 'region A',
            localDeliveryUnit: 'here',
            isPersonProbationPractitionerForOffender: true,
          },
        },
      },
    })

    await practitionerForPartAController.get(mockReq(), res, mockNext())

    expect(res.locals.inputDisplayValues.name).toEqual('test')
    expect(res.locals.inputDisplayValues.email).toEqual('test@here.com')
    expect(res.locals.inputDisplayValues.telephone).toEqual('555555555555')
    expect(res.locals.inputDisplayValues.region).toEqual('place B')
    expect(res.locals.inputDisplayValues.localDeliveryUnit).toEqual('some place')
    expect(res.locals.errors).toEqual({ val: 'some error' })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        name: 'dudette',
        email: 'dudette@here.com',
        telephone: '5555555',
        region: 'region C',
        localDeliveryUnit: 'place A',
        isPersonProbationPractitionerForOffender: 'YES',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await practitionerForPartAController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        practitionerForPartA: {
          name: 'dudette',
          email: 'dudette@here.com',
          telephone: '5555555',
          region: 'region C',
          localDeliveryUnit: 'place A',
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        name: undefined,
        email: undefined,
        telephone: undefined,
        region: undefined,
        localDeliveryUnit: undefined,
        isPersonProbationPractitionerForOffender: undefined,
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await practitionerForPartAController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingPractitionerForPartAName',
        href: '#name',
        invalidParts: undefined,
        name: 'name',
        text: 'Enter the name of the probation practitioner for {{ fullName }}',
        values: undefined,
      },
      {
        errorId: 'missingPractitionerForPartAEmail',
        href: '#email',
        invalidParts: undefined,
        name: 'email',
        text: 'Enter the email of the probation practitioner for {{ fullName }}',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with invalid email', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        name: 'dudette',
        email: 'fabnabit',
        telephone: '5555555',
        region: 'region C',
        localDeliveryUnit: 'place A',
        isPersonProbationPractitionerForOffender: 'YES',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await practitionerForPartAController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'invalidPractitionerForPartAEmail',
        href: '#email',
        invalidParts: undefined,
        name: 'email',
        text: 'Enter an email address in the correct format, like name@example.com',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
