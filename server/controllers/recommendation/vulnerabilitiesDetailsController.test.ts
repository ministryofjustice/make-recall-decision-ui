import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import vulnerabilitiesDetailsController from './vulnerabilitiesDetailsController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

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

    await vulnerabilitiesDetailsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'vulnerabilitiesDetails' })
    expect(res.locals.inputDisplayValues).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/vulnerabilitiesDetails')
    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          vulnerabilities: {
            selected: [{ value: 'RISK_OF_SUICIDE_OR_SELF_HARM', details: '' }],
            allOptions: [
              { value: 'NONE', text: 'None' },
              { value: 'NOT_KNOWN', text: 'Not known' },
              {
                value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
                text: 'Risk of suicide or self-harm',
              },
              { value: 'RELATIONSHIP_BREAKDOWN', text: 'Relationship breakdown' },
              { value: 'DOMESTIC_ABUSE', text: 'Domestic abuse' },
              { value: 'DRUG_OR_ALCOHOL_USE', text: 'Drug or alcohol abuse' },
              { value: 'BULLYING_OTHERS', text: 'Bullying others' },
              {
                value: 'BEING_BULLIED_BY_OTHERS',
                text: 'Being bullied by others',
              },
              {
                value: 'BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS',
                text: 'Being at risk of serious harm from others',
              },
              {
                value: 'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS',
                text: 'Adult or child safeguarding concerns',
              },
              { value: 'MENTAL_HEALTH_CONCERNS', text: 'Mental health concerns' },
              {
                value: 'PHYSICAL_HEALTH_CONCERNS',
                text: 'Physical health concerns',
              },
              {
                value: 'MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION',
                text: 'Medication taken, including compliance with medication',
              },
              { value: 'BEREAVEMENT_ISSUES', text: 'Bereavement issues' },
              { value: 'LEARNING_DIFFICULTIES', text: 'Learning difficulties' },
              { value: 'PHYSICAL_DISABILITIES', text: 'Physical disabilities' },
              {
                value: 'CULTURAL_OR_LANGUAGE_DIFFERENCES',
                text: 'Cultural or language differences',
              },
            ],
          },
        },
        token: 'token1',
      },
    })

    await vulnerabilitiesDetailsController.get(mockReq(), res, mockNext())

    expect(res.locals.inputDisplayValues).toEqual([{ details: '', value: 'RISK_OF_SUICIDE_OR_SELF_HARM' }])
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
              href: '#vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
              errorId: 'missingVulnerabilitiesDetails',
              html: 'Enter more details for risk of suicide or self-harm',
            },
          ],
          'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM': {
            text: 'Enter more details for risk of suicide or self-harm',
            href: '#vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
            errorId: 'missingVulnerabilitiesDetails',
          },
        },
        recommendation: {},
        token: 'token1',
      },
    })

    await vulnerabilitiesDetailsController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
          href: '#vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
          errorId: 'missingVulnerabilitiesDetails',
          html: 'Enter more details for risk of suicide or self-harm',
        },
      ],
      'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM': {
        text: 'Enter more details for risk of suicide or self-harm',
        href: '#vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
        errorId: 'missingVulnerabilitiesDetails',
      },
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM': 'test',
      },
    })
    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: {
          vulnerabilities: {
            selected: [{ value: 'RISK_OF_SUICIDE_OR_SELF_HARM', detail: '' }],
          },
        },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await vulnerabilitiesDetailsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        vulnerabilities: {
          allOptions: [
            {
              value: 'NONE',
              text: 'None',
            },
            {
              value: 'NOT_KNOWN',
              text: 'Not known',
            },
            {
              value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
              text: 'Risk of suicide or self-harm',
            },
            {
              value: 'RELATIONSHIP_BREAKDOWN',
              text: 'Relationship breakdown',
            },
            {
              value: 'DOMESTIC_ABUSE',
              text: 'Domestic abuse',
            },
            {
              value: 'DRUG_OR_ALCOHOL_USE',
              text: 'Drug or alcohol abuse',
            },
            {
              value: 'BULLYING_OTHERS',
              text: 'Bullying others',
            },
            {
              value: 'BEING_BULLIED_BY_OTHERS',
              text: 'Being bullied by others',
            },
            {
              value: 'BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS',
              text: 'Being at risk of serious harm from others',
            },
            {
              value: 'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS',
              text: 'Adult or child safeguarding concerns',
            },
            {
              value: 'MENTAL_HEALTH_CONCERNS',
              text: 'Mental health concerns',
            },
            {
              value: 'PHYSICAL_HEALTH_CONCERNS',
              text: 'Physical health concerns',
            },
            {
              value: 'MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION',
              text: 'Medication taken, including compliance with medication',
            },
            {
              value: 'BEREAVEMENT_ISSUES',
              text: 'Bereavement issues',
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
              value: 'CULTURAL_OR_LANGUAGE_DIFFERENCES',
              text: 'Cultural or language differences',
            },
          ],
          selected: [{ value: 'RISK_OF_SUICIDE_OR_SELF_HARM', details: 'test' }],
        },
      },
      token: 'token1',
      featureFlags: {},
    })
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        'vulnerabilitiesDetail-RISK_OF_SUICIDE_OR_SELF_HARM': '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: {
          vulnerabilities: {
            selected: [{ value: 'RISK_OF_SUICIDE_OR_SELF_HARM', detail: '' }],
          },
        },
      },
    })

    await vulnerabilitiesDetailsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingVulnerabilitiesDetails',
        href: '#vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
        text: 'Enter more detail for risk of suicide or self-harm',
        name: 'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, 'some-url')
  })
})
