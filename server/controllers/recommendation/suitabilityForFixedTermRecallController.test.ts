import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import suitabilityForFixedTermRecallController from './suitabilityForFixedTermRecallController'
import { getCaseSection } from '../caseSummary/getCaseSection'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../caseSummary/getCaseSection')

describe('get', () => {
  beforeEach(() => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { licence: 'case summary data' },
    })
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { mappa: 'mappa summary data' },
    })
  })
  const commonFields = ['isUnder18']
  const currentFieldIds = ['isSentence12MonthsOrOver', 'isMappaLevelAbove1', 'hasBeenConvictedOfSeriousOffence']
  const ftr48FieldIds = [
    'isSentence48MonthsOrOver',
    'isMappaCategory4',
    'isMappaLevel2Or3',
    'isRecalledOnNewChargedOffence',
    'isServingFTSentenceForTerroristOffence',
    'hasBeenChargedWithTerroristOrStateThreatOffence',
  ]
  const allFields = [...commonFields, ...currentFieldIds, ...ftr48FieldIds]

  describe('load with no data', () => {
    it('with FTR48 flag enabled', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            personOnProbation: {
              name: faker.person.fullName(),
            },
          },
          token: 'token1',
          flags: { flagFtr48Updates: true },
        },
      })
      const next = mockNext()
      await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
      expect(res.locals.caseSummary).toEqual({ licence: 'case summary data', mappa: 'mappa summary data' })
      expect(res.locals.page).toEqual({ id: 'ftr48SuitabilityForFixedTermRecall' })
      allFields.forEach(fieldId => {
        expect(res.locals.inputDisplayValues[fieldId].value).not.toBeDefined()
      })
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/suitabilityForFixedTermRecall')
      expect(next).toHaveBeenCalled()
    })
    it('with FTR48 flag disabled', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            personOnProbation: {
              name: faker.person.fullName(),
            },
          },
          token: 'token1',
          flags: {},
        },
      })
      const next = mockNext()
      await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
      expect(res.locals.caseSummary).toEqual({ licence: 'case summary data', mappa: 'mappa summary data' })
      expect(res.locals.page).toEqual({ id: 'suitabilityForFixedTermRecall' })
      allFields.forEach(fieldId => {
        expect(res.locals.inputDisplayValues[fieldId].value).not.toBeDefined()
      })
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/suitabilityForFixedTermRecall')
      expect(next).toHaveBeenCalled()
    })
  })

  describe('load with existing data', () => {
    it('with FTR48 flag enabled', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            isUnder18: true,
            isSentence48MonthsOrOver: true,
            isMappaCategory4: true,
            isMappaLevel2Or3: true,
            isRecalledOnNewChargedOffence: true,
            isServingFTSentenceForTerroristOffence: true,
            hasBeenChargedWithTerroristOrStateThreatOffence: true,
            personOnProbation: {
              name: faker.person.fullName(),
            },
          },
          token: 'token1',
          flags: { flagFtr48Updates: true },
        },
      })
      const next = mockNext()
      await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
      expect(res.locals.inputDisplayValues.isUnder18.value).toEqual('YES')
      ftr48FieldIds.forEach(fieldId => {
        expect(res.locals.inputDisplayValues[fieldId].value).toEqual('YES')
      })
      currentFieldIds.forEach(fieldId => {
        expect(res.locals.inputDisplayValues[fieldId].value).not.toBeDefined()
      })
    })
    it('with FTR48 flag disabled', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            isUnder18: true,
            isSentence12MonthsOrOver: true,
            isMappaLevelAbove1: true,
            hasBeenConvictedOfSeriousOffence: true,
            personOnProbation: {
              name: faker.person.fullName(),
            },
          },
          token: 'token1',
          flags: {},
        },
      })
      const next = mockNext()
      await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
      expect(res.locals.inputDisplayValues.isUnder18.value).toEqual('YES')
      currentFieldIds.forEach(fieldId => {
        expect(res.locals.inputDisplayValues[fieldId].value).toEqual('YES')
      })
      ftr48FieldIds.forEach(fieldId => {
        expect(res.locals.inputDisplayValues[fieldId].value).not.toBeDefined()
      })
    })
  })

  describe('load with existing data inverted', () => {
    it('with FTR48 flag enabled', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            isUnder18: false,
            isSentence48MonthsOrOver: true,
            isMappaCategory4: false,
            isMappaLevel2Or3: true,
            isRecalledOnNewChargedOffence: false,
            isServingFTSentenceForTerroristOffence: true,
            hasBeenChargedWithTerroristOrStateThreatOffence: false,
            personOnProbation: {
              name: faker.person.fullName(),
            },
          },
          token: 'token1',
          flags: { flagFtr48Updates: true },
        },
      })
      const next = mockNext()
      await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
      expect(res.locals.inputDisplayValues.isUnder18.value).toEqual('NO')
      expect(res.locals.inputDisplayValues.isSentence48MonthsOrOver.value).toEqual('YES')
      expect(res.locals.inputDisplayValues.isMappaCategory4.value).toEqual('NO')
      expect(res.locals.inputDisplayValues.isMappaLevel2Or3.value).toEqual('YES')
      expect(res.locals.inputDisplayValues.isRecalledOnNewChargedOffence.value).toEqual('NO')
      expect(res.locals.inputDisplayValues.isServingFTSentenceForTerroristOffence.value).toEqual('YES')
      expect(res.locals.inputDisplayValues.hasBeenChargedWithTerroristOrStateThreatOffence.value).toEqual('NO')

      currentFieldIds.forEach(fieldId => {
        expect(res.locals.inputDisplayValues[fieldId].value).not.toBeDefined()
      })
    })
    it('with FTR48 flag disabled', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            isUnder18: false,
            isSentence12MonthsOrOver: false,
            isMappaLevelAbove1: true,
            hasBeenConvictedOfSeriousOffence: true,
            personOnProbation: {
              name: faker.person.fullName(),
            },
          },
          token: 'token1',
          flags: {},
        },
      })
      const next = mockNext()
      await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
      expect(res.locals.inputDisplayValues.isUnder18.value).toEqual('NO')
      expect(res.locals.inputDisplayValues.isSentence12MonthsOrOver.value).toEqual('NO')
      expect(res.locals.inputDisplayValues.isMappaLevelAbove1.value).toEqual('YES')
      expect(res.locals.inputDisplayValues.hasBeenConvictedOfSeriousOffence.value).toEqual('YES')

      ftr48FieldIds.forEach(fieldId => {
        expect(res.locals.inputDisplayValues[fieldId].value).not.toBeDefined()
      })
    })
  })

  it('load with errors', async () => {
    const res = mockRes({
      locals: {
        unsavedValues: {
          isSentence12MonthsOrOver: 'YES',
          isMappaLevelAbove1: 'NO',
          hasBeenConvictedOfSeriousOffence: 'YES',
        },
        recommendation: {
          isUnder18: true,
          isSentence12MonthsOrOver: true,
          isMappaLevelAbove1: true,
          hasBeenConvictedOfSeriousOffence: true,
          personOnProbation: {
            name: faker.person.fullName(),
          },
        },
        token: 'token1',
        errors: [
          {
            name: 'isUnder18',
            text: 'Select whether {{ fullName }} is 18 or over',
            href: '#isUnder18',
            errorId: 'noIsUnder18',
          },
        ],
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

    expect(res.locals.errors[0]).toEqual({
      name: 'isUnder18',
      text: 'Select whether {{ fullName }} is 18 or over',
      href: '#isUnder18',
      errorId: 'noIsUnder18',
    })

    expect(res.locals.inputDisplayValues.isUnder18.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isSentence12MonthsOrOver.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isMappaLevelAbove1.value).toEqual('NO')
    expect(res.locals.inputDisplayValues.hasBeenConvictedOfSeriousOffence.value).toEqual('YES')
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: [
          {
            name: 'isUnder18',
            text: 'Select whether {{ fullName }} is 18 or over',
            href: '#isUnder18',
            errorId: 'noIsUnder18',
          },
        ],
        recommendation: {
          isExtendedSentence: '',
          personOnProbation: {
            name: faker.person.fullName(),
          },
        },
        token: 'token1',
      },
    })

    await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.errors[0]).toEqual({
      name: 'isUnder18',
      text: 'Select whether {{ fullName }} is 18 or over',
      href: '#isUnder18',
      errorId: 'noIsUnder18',
    })
  })
})

describe('post', () => {
  beforeEach(() => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
  })
  const basePath = `/recommendations/123/`
  describe('post with valid data', () => {
    it('with FTR48 flag enabled', async () => {
      const req = mockReq({
        params: { recommendationId: '123' },
        body: {
          isUnder18: 'YES',
          isSentence48MonthsOrOver: 'YES',
          isMappaCategory4: 'YES',
          isMappaLevel2Or3: 'YES',
          isRecalledOnNewChargedOffence: 'YES',
          isServingFTSentenceForTerroristOffence: 'YES',
          hasBeenChargedWithTerroristOrStateThreatOffence: 'YES',
        },
      })

      const res = mockRes({
        token: 'token1',
        locals: {
          recommendation: { personOnProbation: { name: faker.person.fullName() } },
          urlInfo: { basePath },
          statuses: [],
          flags: { flagFtr48Updates: true },
        },
      })
      const next = mockNext()

      await suitabilityForFixedTermRecallController.post(req, res, next)

      expect(updateRecommendation).toHaveBeenCalledWith({
        recommendationId: '123',
        token: 'token1',
        valuesToSave: {
          isUnder18: true,
          isSentence48MonthsOrOver: true,
          isMappaCategory4: true,
          isMappaLevel2Or3: true,
          isRecalledOnNewChargedOffence: true,
          isServingFTSentenceForTerroristOffence: true,
          hasBeenChargedWithTerroristOrStateThreatOffence: true,
        },
        featureFlags: { flagFtr48Updates: true },
      })

      expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/recall-type`)
      expect(next).not.toHaveBeenCalled() // end of the line for posts.
    })
    it('with FTR48 flag disabled', async () => {
      const req = mockReq({
        params: { recommendationId: '123' },
        body: {
          isUnder18: 'YES',
          isSentence12MonthsOrOver: 'YES',
          isMappaLevelAbove1: 'YES',
          hasBeenConvictedOfSeriousOffence: 'YES',
        },
      })

      const res = mockRes({
        token: 'token1',
        locals: {
          recommendation: { personOnProbation: { name: faker.person.fullName() } },
          urlInfo: { basePath },
          statuses: [],
          flags: {},
        },
      })
      const next = mockNext()

      await suitabilityForFixedTermRecallController.post(req, res, next)

      expect(updateRecommendation).toHaveBeenCalledWith({
        recommendationId: '123',
        token: 'token1',
        valuesToSave: {
          isUnder18: true,
          isSentence12MonthsOrOver: true,
          isMappaLevelAbove1: true,
          hasBeenConvictedOfSeriousOffence: true,
        },
        featureFlags: {},
      })

      expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/recall-type`)
      expect(next).not.toHaveBeenCalled() // end of the line for posts.
    })
  })

  describe('post with invalid data', () => {
    it('with FTR48 flag enabled', async () => {
      const req = mockReq({
        params: { recommendationId: '123' },
        originalUrl: 'some-url',
        body: {
          isUnder18: '',
          isSentence48MonthsOrOver: '',
          isMappaCategory4: '',
          isMappaLevel2Or3: '',
          isRecalledOnNewChargedOffence: '',
          isServingFTSentenceForTerroristOffence: '',
          hasBeenChargedWithTerroristOrStateThreatOffence: '',
        },
      })

      const res = mockRes({
        token: 'token1',
        locals: {
          recommendation: { personOnProbation: { name: faker.person.fullName() } },
          urlInfo: { basePath },
          statuses: [],
          flags: { flagFtr48Updates: true },
        },
      })
      const next = mockNext()

      await suitabilityForFixedTermRecallController.post(req, res, next)
      expect(updateRecommendation).not.toHaveBeenCalled()

      expect(req.session.errors).toEqual([
        {
          name: 'isSentence48MonthsOrOver',
          text: "Select whether {{ fullName }}'s sentence is 48 months or over",
          href: '#isSentence48MonthsOrOver',
          errorId: 'noIsSentence48MonthsOrOver',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'isUnder18',
          text: 'Select whether {{ fullName }} is under 18',
          href: '#isUnder18',
          errorId: 'noIsUnder18',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'isMappaCategory4',
          text: 'Select whether {{ fullName }} is in MAPPA category 4',
          href: '#isMappaCategory4',
          errorId: 'noIsMappaCategory4',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'isMappaLevel2Or3',
          text: "Select whether {{ fullName }}'s MAPPA level is 2 or 3",
          href: '#isMappaLevel2Or3',
          errorId: 'noIsMappaLevel2Or3',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'isRecalledOnNewChargedOffence',
          text: 'Select whether {{ fullName }} is being recalled on a new charged offence',
          href: '#isRecalledOnNewChargedOffence',
          errorId: 'noIsRecalledOnNewChargedOffence',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'isServingFTSentenceForTerroristOffence',
          text: 'Select whether {{ fullName }} is serving a fixed term sentence for a terrorist offence',
          href: '#isServingFTSentenceForTerroristOffence',
          errorId: 'noIsServingFTSentenceForTerroristOffence',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'hasBeenChargedWithTerroristOrStateThreatOffence',
          text: 'Select whether {{ fullName }} has been charged with a terrorist or state threat offence',
          href: '#hasBeenChargedWithTerroristOrStateThreatOffence',
          errorId: 'noHasBeenChargedWithTerroristOrStateThreatOffence',
          invalidParts: undefined,
          values: undefined,
        },
      ])
      expect(req.session.unsavedValues).toEqual({
        isUnder18: '',
        isSentence48MonthsOrOver: '',
        isMappaCategory4: '',
        isMappaLevel2Or3: '',
        isRecalledOnNewChargedOffence: '',
        isServingFTSentenceForTerroristOffence: '',
        hasBeenChargedWithTerroristOrStateThreatOffence: '',
      })
      expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
    })
    it('with FTR48 flag disabled', async () => {
      const req = mockReq({
        params: { recommendationId: '123' },
        originalUrl: 'some-url',
        body: {
          isUnder18: '',
          isSentence12MonthsOrOver: '',
          isMappaLevelAbove1: '',
          hasBeenConvictedOfSeriousOffence: '',
        },
      })

      const res = mockRes({
        token: 'token1',
        locals: {
          recommendation: { personOnProbation: { name: faker.person.fullName() } },
          urlInfo: { basePath },
          statuses: [],
          flags: {},
        },
      })
      const next = mockNext()

      await suitabilityForFixedTermRecallController.post(req, res, next)

      expect(updateRecommendation).not.toHaveBeenCalled()
      expect(req.session.errors).toEqual([
        {
          name: 'isUnder18',
          text: 'Select whether {{ fullName }} is under 18',
          href: '#isUnder18',
          errorId: 'noIsUnder18',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'isSentence12MonthsOrOver',
          text: 'Select whether the sentence is 12 months or over',
          href: '#isSentence12MonthsOrOver',
          errorId: 'noIsSentence12MonthsOrOver',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'isMappaLevelAbove1',
          text: 'Select whether the MAPPA level is above 1',
          href: '#isMappaLevelAbove1',
          errorId: 'noIsMappaLevelAbove1',
          invalidParts: undefined,
          values: undefined,
        },
        {
          name: 'hasBeenConvictedOfSeriousOffence',
          text: 'Select whether {{ fullName }} has been charged with a serious offence',
          href: '#hasBeenConvictedOfSeriousOffence',
          errorId: 'noHasBeenConvictedOfSeriousOffence',
          invalidParts: undefined,
          values: undefined,
        },
      ])
      expect(req.session.unsavedValues).toEqual({
        hasBeenConvictedOfSeriousOffence: '',
        isMappaLevelAbove1: '',
        isUnder18: '',
        isSentence12MonthsOrOver: '',
      })
      expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
    })
  })

  it('preserves fromPageId and fromAnchor when provided', async () => {
    const expectedFromPageId = faker.word.noun()
    const expectedFromAnchor = faker.word.adjective()
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        isUnder18: 'YES',
        isSentence48MonthsOrOver: 'YES',
        isMappaCategory4: 'YES',
        isMappaLevel2Or3: 'YES',
        isRecalledOnNewChargedOffence: 'YES',
        isServingFTSentenceForTerroristOffence: 'YES',
        hasBeenChargedWithTerroristOrStateThreatOffence: 'YES',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: faker.person.fullName() } },
        urlInfo: { basePath, fromPageId: expectedFromPageId, fromAnchor: expectedFromAnchor },
        statuses: [],
        flags: { flagFtr48Updates: true },
      },
    })
    const next = mockNext()

    await suitabilityForFixedTermRecallController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      303,
      `/recommendations/123/recall-type?fromPageId=${expectedFromPageId}&fromAnchor=${expectedFromAnchor}`
    )
  })
})
