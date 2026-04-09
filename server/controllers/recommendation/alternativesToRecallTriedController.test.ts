import { faker } from '@faker-js/faker/locale/en_GB'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import alternativesToRecallTriedController from './alternativesToRecallTriedController'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { UrlInfoGenerator } from '../../../data/common/urlInfoGenerator'
import ppPaths from '../../routes/paths/pp'
import validateAlternativesTried from '../recommendations/alternativesToRecallTried/formValidator'
import ErrorGenerator from '../../../data/common/errorGenerator'

jest.mock('../recommendations/alternativesToRecallTried/formValidator')
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

  describe('test back button', () => {
    ;[true, false].forEach(flagFTR56Enabled => {
      describe(`FTR56 flag ${flagFTR56Enabled ? 'enabled' : 'disabled'}`, () => {
        ;[true, false].forEach(hasFromPageId => {
          it(`with ${hasFromPageId ? '' : 'no '}fromPageId value in the URL info object`, async () => {
            const urlInfo = UrlInfoGenerator.generate({
              fromPageId: hasFromPageId ? ppPaths.taskListConsiderRecall : 'none',
            })
            const res = mockRes({
              locals: {
                recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
                flags: { flagFTR56Enabled },
                urlInfo,
              },
            })
            await alternativesToRecallTriedController.get(mockReq(), res, mockNext())

            if (flagFTR56Enabled && !hasFromPageId) {
              expect(res.locals.backLinkUrl).toEqual(`${urlInfo.basePath}${ppPaths.taskListConsiderRecall}`)
            } else {
              expect(res.locals.backLinkUrl).toBeUndefined()
            }
          })
        })
      })
    })
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
              text: 'Select one or more licence conditions',
              href: '#licenceConditionsBreached',
              errorId: 'noLicenceConditionsSelected',
            },
          ],
          licenceConditionsBreached: {
            text: 'Select one or more licence conditions',
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
        text: 'Select one or more licence conditions',
      },
      list: [
        {
          href: '#licenceConditionsBreached',
          errorId: 'noLicenceConditionsSelected',
          text: 'Select one or more licence conditions',
          name: 'licenceConditionsBreached',
        },
      ],
    })
  })
})

describe('post', () => {
  describe('post with valid data', () => {
    ;[true, false].forEach(ftr56Enabled => {
      it(`with FTR56 ${ftr56Enabled ? 'enabled' : 'disabled'}`, async () => {
        const validationResults = {
          valuesToSave: {
            alternativesToRecallTried: {
              selected: faker.lorem.word(),
              allOptions: faker.helpers.multiple(() => {
                return { value: faker.lorem.word(), text: faker.lorem.sentence() }
              }),
            },
          },
        }
        ;(validateAlternativesTried as jest.Mock).mockResolvedValue(validationResults)
        ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

        const recommendationId = faker.number.int().toString()
        const req = mockReq({
          params: { recommendationId },
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
            recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
            urlInfo: { basePath: `/recommendations/${recommendationId}/` },
            flags: { flagFTR56Enabled: ftr56Enabled },
          },
        })

        const next = mockNext()
        await alternativesToRecallTriedController.post(req, res, next)

        expect(validateAlternativesTried).toHaveBeenCalledWith({
          requestBody: req.body,
          recommendationId,
          urlInfo: res.locals.urlInfo,
          token: res.locals.user.token,
        })
        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId,
          valuesToSave: validationResults.valuesToSave,
          token: res.locals.user.token,
          featureFlags: res.locals.flags,
        })
        expect(res.redirect).toHaveBeenCalledWith(
          303,
          `/recommendations/${recommendationId}/${ftr56Enabled ? ppPaths.sentenceInformation : ppPaths.taskListConsiderRecall}`,
        )
        expect(next).not.toHaveBeenCalled() // end of the line for posts.
      })
    })
  })

  it('post with invalid data', async () => {
    const validationResults = {
      errors: ErrorGenerator.generate(),
      unsavedValues: faker.helpers.multiple(() => {
        return {
          value: faker.lorem.word(),
          details: faker.lorem.sentence(),
        }
      }),
    }
    ;(validateAlternativesTried as jest.Mock).mockResolvedValue(validationResults)
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const recommendationId = faker.number.int().toString()
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId },
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
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/${recommendationId}/` },
      },
    })

    const next = mockNext()
    await alternativesToRecallTriedController.post(req, res, next)

    expect(validateAlternativesTried).toHaveBeenCalledWith({
      requestBody: req.body,
      recommendationId,
      urlInfo: res.locals.urlInfo,
      token: res.locals.user.token,
    })

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session).toEqual({
      errors: validationResults.errors,
      unsavedValues: validationResults.unsavedValues,
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
