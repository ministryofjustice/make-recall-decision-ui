import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import licenceConditionsController from './licenceConditionsController'
import { fetchAndTransformLicenceConditions } from '../recommendations/licenceConditions/transform'
import { formOptions } from '../recommendations/formOptions/formOptions'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/licenceConditions/transform')

describe('get', () => {
  const licenceConditionsBreached = {
    standardLicenceConditions: {
      selected: ['GOOD_BEHAVIOUR', 'NO_OFFENCE'],
      allOptions: formOptions.standardLicenceConditions,
    },
    additionalLicenceConditions: {
      selectedOptions: [{ mainCatCode: 'NLC5', subCatCode: 'NST14' }],
      allOptions: [
        {
          mainCatCode: 'NLC5',
          subCatCode: 'NST14',
          title: 'Disclosure of information',
          details: 'Notify your supervising officer of any intimate relationships',
          note: 'Persons wife is Joan Smyth',
        },
      ],
    },
  }

  it('load with no data', async () => {
    ;(fetchAndTransformLicenceConditions as jest.Mock).mockResolvedValue({})

    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        token: 'token1',
      },
    })
    const next = mockNext()
    await licenceConditionsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'licenceConditions' })
    expect(res.locals.pageHeadings.licenceConditions).toEqual('What licence conditions has Harry Smith breached?')
    expect(res.locals.pageTitles.licenceConditions).toEqual('What licence conditions has the person breached?')
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/licenceConditions')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    ;(fetchAndTransformLicenceConditions as jest.Mock).mockResolvedValue({})

    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: { name: 'Harry Smith' },
          licenceConditionsBreached,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await licenceConditionsController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      standardLicenceConditions: ['GOOD_BEHAVIOUR', 'NO_OFFENCE'],
      additionalLicenceConditions: [
        {
          mainCatCode: 'NLC5',
          subCatCode: 'NST14',
        },
      ],
    })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'licenceConditionsBreached',
              text: 'You must select one or more licence conditions',
              href: '#licenceConditionsBreached',
              errorId: 'noLicenceConditionsSelected',
            },
          ],
          licenceConditionsBreached: {
            text: 'You must select one or more licence conditions',
            href: '#licenceConditionsBreached',
            errorId: 'noLicenceConditionsSelected',
          },
        },
        recommendation: {
          personOnProbation: { name: 'Harry Smith' },
          licenceConditionsBreached,
        },
        token: 'token1',
      },
    })

    await licenceConditionsController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      licenceConditionsBreached: {
        errorId: 'noLicenceConditionsSelected',
        href: '#licenceConditionsBreached',
        text: 'You must select one or more licence conditions',
      },
      list: [
        {
          href: '#licenceConditionsBreached',
          errorId: 'noLicenceConditionsSelected',
          html: 'You must select one or more licence conditions',
          name: 'licenceConditionsBreached',
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
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: 'standard|NAME_CHANGE',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        flags: { flagTriggerWork: false },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await licenceConditionsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        activeCustodialConvictionCount: 1,
        licenceConditionsBreached: {
          standardLicenceConditions: {
            selected: ['NAME_CHANGE'],
            allOptions: [
              {
                value: 'GOOD_BEHAVIOUR',
                text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period',
              },
              { value: 'NO_OFFENCE', text: 'Not commit any offence' },
              {
                value: 'KEEP_IN_TOUCH',
                text: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer',
              },
              {
                value: 'SUPERVISING_OFFICER_VISIT',
                text: 'Receive visits from the supervising officer in accordance with instructions given by the supervising officer',
              },
              {
                value: 'ADDRESS_APPROVED',
                text: 'Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address',
              },
              {
                value: 'NO_WORK_UNDERTAKEN',
                text: 'Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work',
              },
              {
                value: 'NO_TRAVEL_OUTSIDE_UK',
                text: 'Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal',
              },
              {
                value: 'NAME_CHANGE',
                text: 'Tell your supervising officer if you use a name which is different to the name or names which appear on your licence',
              },
              {
                value: 'CONTACT_DETAILS',
                text: 'Tell your supervising officer if you change or add any contact details, including phone number or email',
              },
            ],
          },
        },
      },
      featureFlags: { flagTriggerWork: false },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/alternatives-tried`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with valid data triggerwork flag set', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: 'standard|NAME_CHANGE',
      },
    })

    const res = mockRes({
      locals: {
        flags: { flagTriggerWork: true },
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await licenceConditionsController.post(req, res, mockNext())

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list-consider-recall`)
  })
  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: undefined,
      },
    })

    const res = mockRes({
      locals: {
        flags: { flagTriggerWork: true },
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await licenceConditionsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noLicenceConditionsSelected',
        href: '#licenceConditionsBreached',
        invalidParts: undefined,
        name: 'licenceConditionsBreached',
        text: 'You must select one or more licence conditions',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/licence-conditions`)
  })
})
