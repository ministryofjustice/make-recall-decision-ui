import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import indeterminateTypeController from './indeterminateTypeController'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        token: 'token1',
      },
    })
    const next = mockNext()
    await indeterminateTypeController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'indeterminateSentenceType' })
    expect(res.locals.pageHeadings.indeterminateSentenceType).toEqual('What type of sentence is Harry Smith on?')
    expect(res.locals.pageTitles.indeterminateSentenceType).toEqual('What type of sentence is the person on?')
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/indeterminateSentenceType')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: { name: 'Harry Smith' },
          indeterminateSentenceType: {
            selected: 'IPP',
            allOptions: [
              { value: 'LIFE', text: 'Life sentence' },
              {
                value: 'IPP',
                text: 'Imprisonment for Public Protection (IPP) sentence',
              },
              { value: 'DPP', text: 'Detention for Public Protection (DPP) sentence' },
            ],
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await indeterminateTypeController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'IPP' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'indeterminateSentenceType',
              href: '#indeterminateSentenceType',
              errorId: 'noIndeterminateSentenceTypeSelected',
              text: 'Select whether Harry Smith is on a life, IPP or DPP sentence',
            },
          ],
          indeterminateSentenceType: {
            text: 'Select whether Harry Smith is on a life, IPP or DPP sentence',
            href: '#indeterminateSentenceType',
            errorId: 'noIndeterminateSentenceTypeSelected',
          },
        },
        recommendation: {
          personOnProbation: { name: 'Harry Smith' },
          indeterminateSentenceType: '',
        },
        token: 'token1',
      },
    })

    await indeterminateTypeController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      indeterminateSentenceType: {
        errorId: 'noIndeterminateSentenceTypeSelected',
        href: '#indeterminateSentenceType',
        text: 'Select whether Harry Smith is on a life, IPP or DPP sentence',
      },
      list: [
        {
          href: '#indeterminateSentenceType',
          errorId: 'noIndeterminateSentenceTypeSelected',
          text: 'Select whether Harry Smith is on a life, IPP or DPP sentence',
          name: 'indeterminateSentenceType',
        },
      ],
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
        crn: 'X098092',
        indeterminateSentenceType: 'IPP',
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

    await indeterminateTypeController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        indeterminateSentenceType: {
          selected: 'IPP',
          allOptions: [
            { value: 'LIFE', text: 'Life sentence' },
            {
              value: 'IPP',
              text: 'Imprisonment for Public Protection (IPP) sentence',
            },
            { value: 'DPP', text: 'Detention for Public Protection (DPP) sentence' },
          ],
        },
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list-consider-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        indeterminateSentenceType: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await indeterminateTypeController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noIndeterminateSentenceTypeSelected',
        href: '#indeterminateSentenceType',
        text: 'Select whether {{ fullName }} is on a life, IPP or DPP sentence',
        name: 'indeterminateSentenceType',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
