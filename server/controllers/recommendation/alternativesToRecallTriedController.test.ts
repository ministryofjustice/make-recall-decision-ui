import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import alternativesToRecallTriedController from './alternativesToRecallTriedController'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  const alternativesToRecallTried = {
    selected: [
      {
        value: 'WARNINGS_LETTER',
        details: 'a warning letter',
      },
      {
        value: 'INCREASED_FREQUENCY',
        details: 'lots of trouble',
      },
    ],
    allOptions: [
      { value: 'NONE', text: 'None' },
      { value: 'WARNINGS_LETTER', text: 'Warnings / licence breach letters' },
      { value: 'INCREASED_FREQUENCY', text: 'Increased frequency of reporting' },
      { value: 'EXTRA_LICENCE_CONDITIONS', text: 'Additional licence conditions' },
      { value: 'REFERRAL_TO_OTHER_TEAMS', text: 'Referral to other teams (e.g. IOM, MAPPA, Gangs Unit)' },
      { value: 'REFERRAL_TO_PARTNERSHIP_AGENCIES', text: 'Referral to partnership agencies' },
      { value: 'REFERRAL_TO_APPROVED_PREMISES', text: 'Referral to approved premises' },
      { value: 'DRUG_TESTING', text: 'Drug testing' },
      { value: 'ALTERNATIVE_TO_RECALL_OTHER', text: 'Other' },
    ],
  }

  it('test back button', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
      },
    })
    await alternativesToRecallTriedController.get(mockReq(), res, mockNext())
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          alternativesToRecallTried,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await alternativesToRecallTriedController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual([
      { details: 'a warning letter', value: 'WARNINGS_LETTER' },
      { details: 'lots of trouble', value: 'INCREASED_FREQUENCY' },
    ])
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
          alternativesToRecallTried,
        },
        token: 'token1',
      },
    })

    await alternativesToRecallTriedController.get(mockReq(), res, mockNext())

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
          text: 'You must select one or more licence conditions',
          name: 'licenceConditionsBreached',
        },
      ],
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        alternativesToRecallTried: 'WARNINGS_LETTER',
        'alternativesToRecallTriedDetail-WARNINGS_LETTER': 'a warning',
        'alternativesToRecallTriedDetail-INCREASED_FREQUENCY': '',
        'alternativesToRecallTriedDetail-EXTRA_LICENCE_CONDITIONS': '',
        'alternativesToRecallTriedDetail-REFERRAL_TO_OTHER_TEAMS': '',
        'alternativesToRecallTriedDetail-REFERRAL_TO_PARTNERSHIP_AGENCIES': '',
        'alternativesToRecallTriedDetail-REFERRAL_TO_APPROVED_PREMISES': '',
        'alternativesToRecallTriedDetail-DRUG_TESTING': '',
        'alternativesToRecallTriedDetail-ALTERNATIVE_TO_RECALL_OTHER': '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await alternativesToRecallTriedController.post(req, res, mockNext())

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list-consider-recall`)
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        alternativesToRecallTried: undefined,
        'alternativesToRecallTriedDetail-WARNINGS_LETTER': '',
        'alternativesToRecallTriedDetail-INCREASED_FREQUENCY': '',
        'alternativesToRecallTriedDetail-EXTRA_LICENCE_CONDITIONS': '',
        'alternativesToRecallTriedDetail-REFERRAL_TO_OTHER_TEAMS': '',
        'alternativesToRecallTriedDetail-REFERRAL_TO_PARTNERSHIP_AGENCIES': '',
        'alternativesToRecallTriedDetail-REFERRAL_TO_APPROVED_PREMISES': '',
        'alternativesToRecallTriedDetail-DRUG_TESTING': '',
        'alternativesToRecallTriedDetail-ALTERNATIVE_TO_RECALL_OTHER': '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await alternativesToRecallTriedController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noAlternativesTriedSelected',
        href: '#alternativesToRecallTried',
        invalidParts: undefined,
        name: 'alternativesToRecallTried',
        text: 'You must select which alternatives to recall have been tried already',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
