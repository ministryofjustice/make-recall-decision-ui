import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import whoCompletedPartAController from './whoCompletedPartAController'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await whoCompletedPartAController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'whoCompletedPartA' })
    expect(res.locals.inputDisplayValues.name).not.toBeDefined()
    expect(res.locals.inputDisplayValues.email).not.toBeDefined()
    expect(res.locals.inputDisplayValues.telephone).not.toBeDefined()
    expect(res.locals.inputDisplayValues.region).not.toBeDefined()
    expect(res.locals.inputDisplayValues.localDeliveryUnit).not.toBeDefined()
    expect(res.locals.inputDisplayValues.isPersonProbationPractitionerForOffender).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/whoCompletedPartA')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          whoCompletedPartA: {
            name: 'dude',
            email: 'dude@me.com',
            telephone: '123456',
            region: 'region A',
            localDeliveryUnit: 'here',
            isPersonProbationPractitionerForOffender: true,
          },
        },
      },
    })

    await whoCompletedPartAController.get(mockReq(), res, mockNext())

    expect(res.locals.inputDisplayValues.name).toEqual('dude')
    expect(res.locals.inputDisplayValues.email).toEqual('dude@me.com')
    expect(res.locals.inputDisplayValues.telephone).toEqual('123456')
    expect(res.locals.inputDisplayValues.region).toEqual('region A')
    expect(res.locals.inputDisplayValues.localDeliveryUnit).toEqual('here')
    expect(res.locals.inputDisplayValues.isPersonProbationPractitionerForOffender).toEqual('YES')
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
            name: 'dude',
            email: 'dude@me.com',
            telephone: '123456',
            region: 'region A',
            localDeliveryUnit: 'here',
            isPersonProbationPractitionerForOffender: true,
          },
        },
      },
    })

    await whoCompletedPartAController.get(mockReq(), res, mockNext())

    expect(res.locals.inputDisplayValues.name).toEqual('test')
    expect(res.locals.inputDisplayValues.email).toEqual('test@here.com')
    expect(res.locals.inputDisplayValues.telephone).toEqual('555555555555')
    expect(res.locals.inputDisplayValues.region).toEqual('place B')
    expect(res.locals.inputDisplayValues.localDeliveryUnit).toEqual('some place')
    expect(res.locals.inputDisplayValues.isPersonProbationPractitionerForOffender).toEqual('NO')
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
        name: 'dude',
        email: 'dude@here.com',
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

    await whoCompletedPartAController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        whoCompletedPartA: {
          name: 'dude',
          email: 'dude@here.com',
          telephone: '5555555',
          region: 'region C',
          localDeliveryUnit: 'place A',
          isPersonProbationPractitionerForOffender: true,
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post with NO for practitioner', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        name: 'dude',
        email: 'dude@here.com',
        telephone: '5555555',
        region: 'region C',
        localDeliveryUnit: 'place A',
        isPersonProbationPractitionerForOffender: 'NO',
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

    await whoCompletedPartAController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/practitioner-for-part-a`)
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

    await whoCompletedPartAController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingWhoCompletedPartAName',
        href: '#name',
        invalidParts: undefined,
        name: 'name',
        text: 'Enter the name of the person who completed the Part A',
        values: undefined,
      },
      {
        errorId: 'missingWhoCompletedPartAEmail',
        href: '#email',
        invalidParts: undefined,
        name: 'email',
        text: 'Enter the email of the person who completed the Part A',
        values: undefined,
      },
      {
        errorId: 'missingIsPersonProbationPractitionerForOffender',
        href: '#isPersonProbationPractitionerForOffender',
        invalidParts: undefined,
        name: 'isPersonProbationPractitionerForOffender',
        text: 'Select whether this person is the probation practitioner for {{ fullName }}',
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
        name: 'dude',
        email: 'fabnabit',
        telephone: '5555555',
        region: 'region C',
        localDeliveryUnit: 'place A',
        isPersonProbationPractitionerForOffender: 'NO',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await whoCompletedPartAController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'invalidWhoCompletedPartAEmail',
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
