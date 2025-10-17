import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import vulnerabilitiesController from './vulnerabilitiesController'
import {
  vulnerabilities,
  vulnerabilitiesRiskToSelf,
  VULNERABILITY,
} from '../recommendations/vulnerabilities/formOptions'

jest.mock('../../data/makeDecisionApiClient')

describe('get with RiskToSelf enabled', () => {
  const compactedListRiskToSelf = vulnerabilitiesRiskToSelf.map(({ value, text }) => ({ value, text }))
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          vulnerabilities: null,
        },
        token: 'token1',
        flags: { flagRiskToSelfEnabled: true },
      },
    })
    const next = mockNext()
    await vulnerabilitiesController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'vulnerabilitiesRiskToSelf' })
    expect(res.locals.inputDisplayValues).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/vulnerabilities')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data for checkboxes', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          vulnerabilities: {
            selected: [{ value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM }],
            allOptions: compactedListRiskToSelf,
          },
        },
        token: 'token1',
        flags: { flagRiskToSelfEnabled: true },
      },
    })
    const next = mockNext()
    await vulnerabilitiesController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual([{ value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM }])
  })

  it('load with existing data for radio buttons', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          vulnerabilities: {
            selected: [VULNERABILITY.NONE_OR_NOT_KNOWN, VULNERABILITY.NONE],
            allOptions: compactedListRiskToSelf,
          },
        },
        token: 'token1',
        flags: { flagRiskToSelfEnabled: true },
      },
    })
    const next = mockNext()
    await vulnerabilitiesController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual([VULNERABILITY.NONE_OR_NOT_KNOWN, VULNERABILITY.NONE])
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
              href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
              errorId: 'noVulnerabilitiesSelected',
              html: 'Select ‘No concerns about vulnerabilities or needs’, or ‘Do not know about vulnerabilities or needs’',
            },
          ],
        },
        recommendation: {
          indeterminateOrExtendedSentenceDetails: [{}],
        },
        token: 'token1',
        flags: { flagRiskToSelfEnabled: true },
      },
    })

    await vulnerabilitiesController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
          href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
          errorId: 'noVulnerabilitiesSelected',
          html: 'Select ‘No concerns about vulnerabilities or needs’, or ‘Do not know about vulnerabilities or needs’',
        },
      ],
    })
  })

  it('initial load with error data for exclusive radio buttons', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'vulnerabilities-exclusive',
              href: '#exclusive-1',
              errorId: 'vulnerabilities-exclusive',
              html: 'Select ‘No concerns about vulnerabilities or needs’, or ‘Do not know about vulnerabilities or needs’',
            },
          ],
        },
        recommendation: {
          indeterminateOrExtendedSentenceDetails: [{}],
        },
        token: 'token1',
        flags: { flagRiskToSelfEnabled: true },
      },
    })

    await vulnerabilitiesController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'vulnerabilities-exclusive',
          href: '#exclusive-1',
          errorId: 'vulnerabilities-exclusive',
          html: 'Select ‘No concerns about vulnerabilities or needs’, or ‘Do not know about vulnerabilities or needs’',
        },
      ],
    })
  })
})

describe('post with RiskToSelf enabled', () => {
  const compactedListRiskToSelf = vulnerabilitiesRiskToSelf.map(({ value, text }) => ({ value, text }))
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        vulnerabilities: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath },
        flags: { flagRiskToSelfEnabled: true },
      },
    })
    const next = mockNext()

    await vulnerabilitiesController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        vulnerabilities: {
          selected: [{ value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM }],
          allOptions: compactedListRiskToSelf,
        },
      },
      token: 'token1',
      featureFlags: {
        flagRiskToSelfEnabled: true,
      },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/vulnerabilities-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        abc: 'INVALID_FORM_DATA',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
        flags: { flagRiskToSelfEnabled: true },
      },
    })

    await vulnerabilitiesController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('redirect to the task list page after save when "none or unknown" is selected', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        vulnerabilities: [VULNERABILITY.NONE_OR_NOT_KNOWN, VULNERABILITY.NONE],
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath },
        flags: { flagRiskToSelfEnabled: true },
      },
    })
    const next = mockNext()

    await vulnerabilitiesController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        vulnerabilities: {
          selected: [{ value: VULNERABILITY.NONE, details: undefined }],
          allOptions: compactedListRiskToSelf,
        },
      },
      token: 'token1',
      featureFlags: {
        flagRiskToSelfEnabled: true,
      },
    })
    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/task-list#heading-vulnerability')
    expect(next).not.toHaveBeenCalled()
  })
})

describe('get', () => {
  const compactedList = vulnerabilities.map(({ value, text }) => ({ value, text }))
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          vulnerabilities: null,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await vulnerabilitiesController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'vulnerabilities' })
    expect(res.locals.inputDisplayValues).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/vulnerabilities')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          vulnerabilities: {
            selected: [{ value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM, details: 'test' }],
            allOptions: compactedList,
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await vulnerabilitiesController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual([
      { details: 'test', value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM },
    ])
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
              href: '#vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
              errorId: 'missingVulnerabilitiesDetail',
              html: 'Enter more detail for risk of suicide or self-harm',
            },
          ],
          'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM': {
            text: 'Enter more detail for risk of suicide or self-harm',
            href: '#vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
            errorId: 'missingVulnerabilitiesDetail',
          },
        },
        recommendation: {
          indeterminateOrExtendedSentenceDetails: [{}],
        },
        token: 'token1',
      },
    })

    await vulnerabilitiesController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
          href: '#vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
          errorId: 'missingVulnerabilitiesDetail',
          html: 'Enter more detail for risk of suicide or self-harm',
        },
      ],
      'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM': {
        text: 'Enter more detail for risk of suicide or self-harm',
        href: '#vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
        errorId: 'missingVulnerabilitiesDetail',
      },
    })
  })
})

describe('post', () => {
  const compactedList = vulnerabilities.map(({ value, text }) => ({ value, text }))
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        vulnerabilities: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
        'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM': 'test',
        'vulnerabilitiesDetail-RELATIONSHIP_BREAKDOWN': '',
        'vulnerabilitiesDetail-DOMESTIC_ABUSE': '',
        'vulnerabilitiesDetail-DRUG_OR_ALCOHOL_USE': '',
        'vulnerabilitiesDetail-BULLYING_OTHERS': '',
        'vulnerabilitiesDetail-BEING_BULLIED_BY_OTHERS': '',
        'vulnerabilitiesDetail-BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS': '',
        'vulnerabilitiesDetail-ADULT_OR_CHILD_SAFEGUARDING_CONCERNS': '',
        'vulnerabilitiesDetail-MENTAL_HEALTH_CONCERNS': '',
        'vulnerabilitiesDetail-PHYSICAL_HEALTH_CONCERNS': '',
        'vulnerabilitiesDetail-MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION': '',
        'vulnerabilitiesDetail-BEREAVEMENT_ISSUES': '',
        'vulnerabilitiesDetail-LEARNING_DIFFICULTIES': '',
        'vulnerabilitiesDetail-PHYSICAL_DISABILITIES': '',
        'vulnerabilitiesDetail-CULTURAL_OR_LANGUAGE_DIFFERENCES': '',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await vulnerabilitiesController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        vulnerabilities: {
          selected: [{ value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM, details: 'test' }],
          allOptions: compactedList,
        },
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-vulnerability`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        vulnerabilities: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
        'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM': '',
        'vulnerabilitiesDetail-RELATIONSHIP_BREAKDOWN': '',
        'vulnerabilitiesDetail-DOMESTIC_ABUSE': '',
        'vulnerabilitiesDetail-DRUG_OR_ALCOHOL_USE': '',
        'vulnerabilitiesDetail-BULLYING_OTHERS': '',
        'vulnerabilitiesDetail-BEING_BULLIED_BY_OTHERS': '',
        'vulnerabilitiesDetail-BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS': '',
        'vulnerabilitiesDetail-ADULT_OR_CHILD_SAFEGUARDING_CONCERNS': '',
        'vulnerabilitiesDetail-MENTAL_HEALTH_CONCERNS': '',
        'vulnerabilitiesDetail-PHYSICAL_HEALTH_CONCERNS': '',
        'vulnerabilitiesDetail-MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION': '',
        'vulnerabilitiesDetail-BEREAVEMENT_ISSUES': '',
        'vulnerabilitiesDetail-LEARNING_DIFFICULTIES': '',
        'vulnerabilitiesDetail-PHYSICAL_DISABILITIES': '',
        'vulnerabilitiesDetail-CULTURAL_OR_LANGUAGE_DIFFERENCES': '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await vulnerabilitiesController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingVulnerabilitiesDetail',
        href: '#vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
        text: 'Enter more detail for risk of suicide or self-harm',
        name: 'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
