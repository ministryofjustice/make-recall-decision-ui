import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import vulnerabilitiesController from './vulnerabilitiesController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
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

  it('load with existing data for checkboxes', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          vulnerabilities: {
            selected: [{ value: 'RISK_OF_SUICIDE_OR_SELF_HARM', details: 'test' }],
            allOptions: [
              {
                value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
                text: 'At risk of suicide or self-harm',
              },
              {
                value: 'DRUG_OR_ALCOHOL_USE',
                text: 'Drug and alcohol abuse',
              },
              {
                value: 'MENTAL_HEALTH_CONCERNS',
                text: 'Mental health concerns',
              },
              {
                value: 'MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION',
                text: 'Medication taken, including compliance with medication',
              },
              {
                value: 'PHYSICAL_HEALTH_CONCERNS',
                text: 'Physical health concerns',
              },
              {
                value: 'LEARNING_DIFFICULTIES',
                text: 'Learning difficulties',
              },
              {
                value: 'PHYSICAL_DISABILITIES',
                text: 'Physical disabilities',
              },
              {
                value: 'DOMESTIC_ABUSE',
                text: 'Domestic abuse',
              },
              {
                value: 'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS',
                text: 'Adult or child safeguarding concerns',
              },
              {
                value: 'BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS',
                text: 'Being at risk of serious harm from others',
              },
              {
                value: 'BEING_BULLIED_BY_OTHERS',
                text: 'Being bullied by others',
              },
              {
                value: 'BULLYING_OTHERS',
                text: 'Bullying others',
              },
              {
                value: 'RELATIONSHIP_BREAKDOWN',
                text: 'Relationship breakdown',
              },
              {
                value: 'BEREAVEMENT_ISSUES',
                text: 'Bereavement issues',
              },
              {
                value: 'CULTURAL_OR_LANGUAGE_DIFFERENCES',
                text: 'Cultural or language differences',
              },
              {
                value: 'NONE_OR_NOT_KNOWN',
                text: 'No concerns or do not know',
              },
            ],
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await vulnerabilitiesController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual([{ details: 'test', value: 'RISK_OF_SUICIDE_OR_SELF_HARM' }])
  })

  it('load with existing data for radio buttons', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          vulnerabilities: {
            selected: ['NONE_OR_NOT_KNOWN', 'NONE'],
            allOptions: [
              {
                value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
                text: 'At risk of suicide or self-harm',
              },
              {
                value: 'DRUG_OR_ALCOHOL_USE',
                text: 'Drug and alcohol abuse',
              },
              {
                value: 'MENTAL_HEALTH_CONCERNS',
                text: 'Mental health concerns',
              },
              {
                value: 'MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION',
                text: 'Medication taken, including compliance with medication',
              },
              {
                value: 'PHYSICAL_HEALTH_CONCERNS',
                text: 'Physical health concerns',
              },
              {
                value: 'LEARNING_DIFFICULTIES',
                text: 'Learning difficulties',
              },
              {
                value: 'PHYSICAL_DISABILITIES',
                text: 'Physical disabilities',
              },
              {
                value: 'DOMESTIC_ABUSE',
                text: 'Domestic abuse',
              },
              {
                value: 'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS',
                text: 'Adult or child safeguarding concerns',
              },
              {
                value: 'BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS',
                text: 'Being at risk of serious harm from others',
              },
              {
                value: 'BEING_BULLIED_BY_OTHERS',
                text: 'Being bullied by others',
              },
              {
                value: 'BULLYING_OTHERS',
                text: 'Bullying others',
              },
              {
                value: 'RELATIONSHIP_BREAKDOWN',
                text: 'Relationship breakdown',
              },
              {
                value: 'BEREAVEMENT_ISSUES',
                text: 'Bereavement issues',
              },
              {
                value: 'CULTURAL_OR_LANGUAGE_DIFFERENCES',
                text: 'Cultural or language differences',
              },
              {
                value: 'NONE_OR_NOT_KNOWN',
                text: 'No concerns or do not know',
              },
            ],
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await vulnerabilitiesController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual(['NONE_OR_NOT_KNOWN', 'NONE'])
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

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        vulnerabilities: 'RISK_OF_SUICIDE_OR_SELF_HARM',
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
          selected: [{ value: 'RISK_OF_SUICIDE_OR_SELF_HARM', details: 'test' }],
          allOptions: [
            {
              value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
              text: 'At risk of suicide or self-harm',
            },
            {
              value: 'DRUG_OR_ALCOHOL_USE',
              text: 'Drug and alcohol abuse',
            },
            {
              value: 'MENTAL_HEALTH_CONCERNS',
              text: 'Mental health concerns',
            },
            {
              value: 'MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION',
              text: 'Medication taken, including compliance with medication',
            },
            {
              value: 'PHYSICAL_HEALTH_CONCERNS',
              text: 'Physical health concerns',
            },
            {
              value: 'LEARNING_DIFFICULTIES',
              text: 'Learning difficulties',
            },
            {
              value: 'PHYSICAL_DISABILITIES',
              text: 'Physical disabilities',
            },
            {
              value: 'DOMESTIC_ABUSE',
              text: 'Domestic abuse',
            },
            {
              value: 'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS',
              text: 'Adult or child safeguarding concerns',
            },
            {
              value: 'BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS',
              text: 'Being at risk of serious harm from others',
            },
            {
              value: 'BEING_BULLIED_BY_OTHERS',
              text: 'Being bullied by others',
            },
            {
              value: 'BULLYING_OTHERS',
              text: 'Bullying others',
            },
            {
              value: 'RELATIONSHIP_BREAKDOWN',
              text: 'Relationship breakdown',
            },
            {
              value: 'BEREAVEMENT_ISSUES',
              text: 'Bereavement issues',
            },
            {
              value: 'CULTURAL_OR_LANGUAGE_DIFFERENCES',
              text: 'Cultural or language differences',
            },
            {
              value: 'NONE_OR_NOT_KNOWN',
              text: 'No concerns or do not know',
            },
          ],
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
        vulnerabilities: 'RISK_OF_SUICIDE_OR_SELF_HARM',
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
        text: 'Enter more detail for at risk of suicide or self-harm',
        name: 'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
