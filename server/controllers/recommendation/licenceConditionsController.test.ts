import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import licenceConditionsController from './licenceConditionsController'
import { fetchAndTransformLicenceConditions } from '../recommendations/licenceConditions/transform'
import { formOptions } from '../recommendations/formOptions/formOptions'
import { getCaseSummaryV2, updateRecommendation } from '../../data/makeDecisionApiClient'
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
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/licenceConditions')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    ;(fetchAndTransformLicenceConditions as jest.Mock).mockResolvedValue({})

    const res = mockRes({
      locals: {
        recommendation: {
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
          text: 'You must select one or more licence conditions',
          name: 'licenceConditionsBreached',
        },
      ],
    })
  })
})

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
        description: 'Buggery and attempted buggery',
      },
      licenceConditions: [] as string[],
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
    ],
    additionalLicenceConditions: [
      {
        code: '9ce9d594-e346-4785-9642-c87e764bee39',
        text: 'This is an additional licence condition',
        expandedText: 'Expanded additional licence condition',
        category: 'Freedom of movement',
      },
    ],
    bespokeConditions: [
      {
        code: '9ce9d594-e346-4785-9642-c87e764bee45',
        text: 'This is a bespoke condition',
        expandedText: null as string,
        category: null as string,
      },
    ],
  },
}

describe('get - cvlFlag', () => {
  it('load with no data', async () => {
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(TEMPLATE)

    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        token: 'token1',
        flags: { flagCvl: true },
      },
    })
    const next = mockNext()
    await licenceConditionsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'licenceConditions' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.locals.caseSummary).toStrictEqual({
      ...TEMPLATE,
      licenceConvictions: {
        activeCustodial: TEMPLATE.activeConvictions.filter(
          conviction => conviction.sentence && conviction.sentence.isCustodial
        ),
        hasMultipleActiveCustodial: false,
      },
      standardLicenceConditions: formOptions.standardLicenceConditions,
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/licenceConditions')

    expect(next).toHaveBeenCalled()
  })

  const cvlLicenceConditionsBreached = {
    standardLicenceConditions: {
      selected: ['9ce9d594-e346-4785-9642-c87e764bee37'],
      allOptions: [{ code: '9ce9d594-e346-4785-9642-c87e764bee37', text: 'This is a standard licence condition' }],
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

    const res = mockRes({
      locals: {
        recommendation: {
          cvlLicenceConditionsBreached,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await licenceConditionsController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      standardLicenceConditions: ['9ce9d594-e346-4785-9642-c87e764bee37'],
      additionalLicenceConditions: ['9ce9d594-e346-4785-9642-c87e764bee39', '9ce9d594-e346-4785-9642-c87e764bee41'],
      bespokeLicenceConditions: ['9ce9d594-e346-4785-9642-c87e764bee45'],
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
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: undefined,
      },
    })

    const res = mockRes({
      locals: {
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
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})

describe('post - cvlFlag', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(TEMPLATE)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        activeCustodialConvictionCount: '1',
        licenceConditionsBreached: [
          'standard|9ce9d594-e346-4785-9642-c87e764bee37',
          'additional|9ce9d594-e346-4785-9642-c87e764bee39',
          'bespoke|9ce9d594-e346-4785-9642-c87e764bee45',
        ],
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
        flags: { flagCvl: true },
      },
    })
    const next = mockNext()

    await licenceConditionsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        cvlLicenceConditionsBreached: {
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
            selected: ['9ce9d594-e346-4785-9642-c87e764bee39'],
            allOptions: [
              {
                code: '9ce9d594-e346-4785-9642-c87e764bee39',
                text: 'This is an additional licence condition',
              },
            ],
          },
          bespokeLicenceConditions: {
            selected: ['9ce9d594-e346-4785-9642-c87e764bee45'],
            allOptions: [
              {
                code: '9ce9d594-e346-4785-9642-c87e764bee45',
                text: 'This is a bespoke condition',
              },
            ],
          },
        },
      },
      featureFlags: { flagCvl: true },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list-consider-recall`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getCaseSummaryV2 as jest.Mock).mockResolvedValue(TEMPLATE)

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
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
        flags: { flagCvl: true },
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
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
