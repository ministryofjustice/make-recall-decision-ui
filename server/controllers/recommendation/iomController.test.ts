import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import iomController from './iomController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
        token: 'token1',
      },
    })
    const next = mockNext()
    await iomController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'integratedOffenderManagement' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/integratedOffenderManagement')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          isUnderIntegratedOffenderManagement: {
            selected: 'YES',
            allOptions: [
              { value: 'YES', text: 'Yes' },
              { value: 'NO', text: 'No' },
              { value: 'NOT_APPLICABLE', text: 'Not applicable' },
            ],
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await iomController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'YES' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'isUnderIntegratedOffenderManagement',
              href: '#isUnderIntegratedOffenderManagement',
              errorId: 'noIntegratedOffenderManagementSelected',
              html: 'You must select whether Harry Smith is under Integrated Offender Management',
            },
          ],
          isUnderIntegratedOffenderManagement: {
            text: 'You must select whether Harry Smith is under Integrated Offender Management',
            href: '#isUnderIntegratedOffenderManagement',
            errorId: 'noIntegratedOffenderManagementSelected',
          },
        },
        recommendation: {
          isThisAnEmergencyRecall: undefined,
        },
        token: 'token1',
      },
    })

    await iomController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'isUnderIntegratedOffenderManagement',
          href: '#isUnderIntegratedOffenderManagement',
          errorId: 'noIntegratedOffenderManagementSelected',
          html: 'You must select whether Harry Smith is under Integrated Offender Management',
        },
      ],
      isUnderIntegratedOffenderManagement: {
        text: 'You must select whether Harry Smith is under Integrated Offender Management',
        href: '#isUnderIntegratedOffenderManagement',
        errorId: 'noIntegratedOffenderManagementSelected',
      },
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        isUnderIntegratedOffenderManagement: 'YES',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: {},
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await iomController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        isUnderIntegratedOffenderManagement: {
          selected: 'YES',
          allOptions: [
            { value: 'YES', text: 'Yes' },
            { value: 'NO', text: 'No' },
            { value: 'NOT_APPLICABLE', text: 'Not applicable' },
          ],
        },
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-custody`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {},
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await iomController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noIntegratedOffenderManagementSelected',
        href: '#isUnderIntegratedOffenderManagement',
        text: 'You must select whether {{ fullName }} is under Integrated Offender Management',
        name: 'isUnderIntegratedOffenderManagement',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
