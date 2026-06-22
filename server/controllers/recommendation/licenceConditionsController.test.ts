import { faker } from '@faker-js/faker/locale/en_GB'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import licenceConditionsController from './licenceConditionsController'
import { formOptions } from '../recommendations/formOptions/formOptions'
import { getCaseSummaryV2, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import ppPaths from '../../routes/paths/pp.paths'
import { UrlInfoGenerator } from '../../../data/common/urlInfoGenerator'
import { PersonOnProbationGenerator } from '../../../data/recommendations/personOnProbationGenerator'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/licenceConditions/transform')
jest.mock('../raiseWarningBannerEvents')

const TEMPLATE = {
  activeConvictions: [
    {
      number: '1',
      sentence: {
        description: 'Extended Determinate Sentence',
        length: 2,
        lengthUnits: 'Months',
        isCustodial: true,
        custodialStatusCode: 'B',
        licenceExpiryDate: '2020-06-25',
        sentenceExpiryDate: '2020-06-28',
      },
      mainOffence: {
        date: '2022-04-24',
        code: '1234',
        description: 'Assault',
      },
      licenceConditions: [
        {
          mainCategory: {
            code: 'NLC5',
            description: 'Poss, own, control, inspect specified items /docs',
          },
          subCategory: {
            code: 'NST30',
            description: 'On release to be escorted by police to Approved Premises',
          },
        },
        {
          mainCategory: {
            code: 'BB4',
            description: 'Freedom of movement',
          },
        },
      ],
    },
  ],
  cvlLicence: {
    licenceStatus: 'ACTIVE',
    conditionalReleaseDate: '2022-06-10',
    actualReleaseDate: '2022-06-11',
    sentenceStartDate: '2022-06-12',
    sentenceEndDate: '2022-06-13',
    licenceStartDate: '4022-06-14',
    licenceExpiryDate: '2022-06-15',
    topupSupervisionStartDate: '2022-06-16',
    topupSupervisionExpiryDate: '2022-06-17',
    standardLicenceConditions: [
      {
        code: '9ce9d594-e346-4785-9642-c87e764bee37',
        text: 'This is a standard licence condition',
        expandedText: null as string,
        category: null as string,
      },
      null,
    ],
    additionalLicenceConditions: [
      {
        code: '9ce9d594-e346-4785-9642-c87e764bee39',
        text: 'This is an additional licence condition',
        expandedText: 'Expanded additional licence condition',
        category: 'Freedom of movement',
      },
      null,
    ],
    bespokeConditions: [
      {
        code: '9ce9d594-e346-4785-9642-c87e764bee45',
        text: 'This is a bespoke condition',
        expandedText: null as string,
        category: null as string,
      },
      null,
    ],
  },
}

const DELIUS_TEMPLATE = { ...TEMPLATE, cvlLicence: undefined as string | undefined }

describe('get', () => {
  ;[true, false].forEach(hasFromPageId => {
    describe(`with ${hasFromPageId ? '' : 'no '}fromPageId value in the URL info object`, () => {
      ;[true, false].forEach(isApprovedPremisesRoute => {
        if (!(hasFromPageId && isApprovedPremisesRoute)) {
          describe(`on ${isApprovedPremisesRoute ? 'AP' : 'non-AP'} route`, () => {
            it('load with no data', async () => {
              ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(TEMPLATE)

              const req = isApprovedPremisesRoute
                ? mockReq({ originalUrl: `${faker.internet.url()}/ap-licence-conditions` })
                : mockReq()
              const urlInfo = UrlInfoGenerator.generate({
                fromPageId: hasFromPageId ? ppPaths.taskListConsiderRecall : 'none',
              })
              const res = mockRes({
                locals: {
                  recommendation: RecommendationResponseGenerator.generate(),
                  token: 'token1',
                  urlInfo,
                },
              })
              const next = mockNext()
              await licenceConditionsController.get(req, res, next)

              expect(res.locals.page).toEqual({ id: 'licenceConditions' })
              expect(res.locals.inputDisplayValues.value).not.toBeDefined()
              expect(res.locals.caseSummary).toStrictEqual({
                ...TEMPLATE,
                licenceConvictions: {
                  activeCustodial: TEMPLATE.activeConvictions.filter(
                    conviction => conviction.sentence && conviction.sentence.isCustodial,
                  ),
                  hasMultipleActiveCustodial: false,
                },
                standardLicenceConditions: formOptions.standardLicenceConditions,
              })
              if (isApprovedPremisesRoute) {
                expect(res.locals.backLinkUrl).toEqual(`/cases/${res.locals.recommendation.crn}/overview`)
                expect(res.locals.backLinkText).toEqual(
                  `Back to overview for ${res.locals.recommendation.personOnProbation.name}`,
                )
              } else if (!hasFromPageId) {
                expect(res.locals.backLinkUrl).toEqual(`${urlInfo.basePath}${ppPaths.taskListConsiderRecall}`)
                expect(res.locals.backLinkText).toEqual('Back to Consider a recall questions')
              } else {
                expect(res.locals.backLinkUrl).toBeUndefined()
              }
              expect(res.render).toHaveBeenCalledWith('pages/recommendations/licenceConditions')

              expect(next).toHaveBeenCalled()
            })

            const cvlLicenceConditionsBreached = {
              standardLicenceConditions: {
                selected: ['9ce9d594-e346-4785-9642-c87e764bee37'],
                allOptions: [
                  {
                    code: '9ce9d594-e346-4785-9642-c87e764bee37',
                    text: 'This is a standard licence condition',
                  },
                ],
              },
              additionalLicenceConditions: {
                selected: ['9ce9d594-e346-4785-9642-c87e764bee39', '9ce9d594-e346-4785-9642-c87e764bee41'],
                allOptions: [
                  {
                    code: '9ce9d594-e346-4785-9642-c87e764bee39',
                    text: 'This is an additional licence condition',
                  },
                  { code: '9ce9d594-e346-4785-9642-c87e764bee41', text: 'Address approved Text' },
                ],
              },
              bespokeLicenceConditions: {
                selected: ['9ce9d594-e346-4785-9642-c87e764bee45'],
                allOptions: [{ code: '9ce9d594-e346-4785-9642-c87e764bee45', text: 'This is a bespoke condition' }],
              },
            }

            it('load with existing data', async () => {
              ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(TEMPLATE)

              const req = isApprovedPremisesRoute
                ? mockReq({ originalUrl: `${faker.internet.url()}/ap-licence-conditions` })
                : mockReq()
              const urlInfo = UrlInfoGenerator.generate({
                fromPageId: hasFromPageId ? ppPaths.taskListConsiderRecall : 'none',
              })
              const res = mockRes({
                locals: {
                  recommendation: {
                    cvlLicenceConditionsBreached,
                    personOnProbation: PersonOnProbationGenerator.generate('any'),
                  },
                  token: 'token1',
                  urlInfo,
                },
              })
              const next = mockNext()
              await licenceConditionsController.get(req, res, next)

              expect(res.locals.inputDisplayValues).toEqual({
                standardLicenceConditions: ['9ce9d594-e346-4785-9642-c87e764bee37'],
                additionalLicenceConditions: [
                  '9ce9d594-e346-4785-9642-c87e764bee39',
                  '9ce9d594-e346-4785-9642-c87e764bee41',
                ],
                bespokeLicenceConditions: ['9ce9d594-e346-4785-9642-c87e764bee45'],
              })
              if (isApprovedPremisesRoute) {
                expect(res.locals.backLinkUrl).toEqual(`/cases/${res.locals.recommendation.crn}/overview`)
                expect(res.locals.backLinkText).toEqual(
                  `Back to overview for ${res.locals.recommendation.personOnProbation.name}`,
                )
              } else if (!hasFromPageId) {
                expect(res.locals.backLinkUrl).toEqual(`${urlInfo.basePath}${ppPaths.taskListConsiderRecall}`)
                expect(res.locals.backLinkText).toEqual('Back to Consider a recall questions')
              } else {
                expect(res.locals.backLinkUrl).toBeUndefined()
              }
            })

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
                    note: 'Persons wife is Jane Bloggs',
                  },
                ],
              },
            }

            it('initial load with error data', async () => {
              ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(TEMPLATE)

              const req = isApprovedPremisesRoute
                ? mockReq({ originalUrl: `${faker.internet.url()}/ap-licence-conditions` })
                : mockReq()

              const urlInfo = UrlInfoGenerator.generate({
                fromPageId: hasFromPageId ? ppPaths.taskListConsiderRecall : 'none',
              })
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
                    licenceConditionsBreached,
                    personOnProbation: PersonOnProbationGenerator.generate('any'),
                  },
                  token: 'token1',
                  urlInfo,
                },
              })

              await licenceConditionsController.get(req, res, mockNext())

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
              if (isApprovedPremisesRoute) {
                expect(res.locals.backLinkUrl).toEqual(`/cases/${res.locals.recommendation.crn}/overview`)
                expect(res.locals.backLinkText).toEqual(
                  `Back to overview for ${res.locals.recommendation.personOnProbation.name}`,
                )
              } else if (!hasFromPageId) {
                expect(res.locals.backLinkUrl).toEqual(`${urlInfo.basePath}${ppPaths.taskListConsiderRecall}`)
                expect(res.locals.backLinkText).toEqual('Back to Consider a recall questions')
              } else {
                expect(res.locals.backLinkUrl).toBeUndefined()
              }
            })
          })
        }
      })
    })
  })
})

describe('post', () => {
  it('post with crn restricted', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue({
      userAccessResponse: {
        userRestricted: true,
      },
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: 'additional|NST30',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await licenceConditionsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'excludedRestrictedCrn',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'This CRN is excluded or restricted',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with crn multiple active custodial convictions', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue({
      activeConvictions: [
        {
          sentence: {
            isCustodial: true,
            licenceExpiryDate: '2023-06-16',
            sentenceExpiryDate: '2021-11-23',
          },
        },
        {
          sentence: {
            isCustodial: true,
            licenceExpiryDate: '2021-03-24',
          },
        },
      ],
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: 'additional|NST30',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await licenceConditionsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'hasMultipleActiveCustodial',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'This person has multiple active custodial convictions',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with crn no active custodial convictions', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue({ activeConvictions: [] })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: 'additional|NST30',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await licenceConditionsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noActiveCustodial',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'This person has no active custodial convictions',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post in ap journey', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(TEMPLATE)
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: 'standard|NAME_CHANGE',
      },
      originalUrl: '/recommendation/123/ap-licence-conditions',
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()

    await licenceConditionsController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-recall-rationale`)
  })

  it('post with nothing selected and only 1 active conviction', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(DELIUS_TEMPLATE)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: undefined,
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
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
        text: 'Select one or more licence conditions',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with invalid standard condition', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(DELIUS_TEMPLATE)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: 'standard|VALUE',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
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
        text: 'Select one or more licence conditions',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
