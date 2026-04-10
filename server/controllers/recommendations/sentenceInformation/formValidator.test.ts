import { fakerEN_GB as faker } from '@faker-js/faker'
import { SentenceGroup } from './formOptions'
import { UrlInfoGenerator } from '../../../../data/common/urlInfoGenerator'
import validateSentenceInformation from './formValidator'
import { makeErrorObject } from '../../../utils/errors'
import { nextPageLinkUrl, nextPagePreservingFromPageAndAnchor } from '../helpers/urls'
import NamedFormErrorGenerator from '../../../../data/common/errorGenerator'
import ppPaths from '../../../routes/paths/pp'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { IndeterminateSentenceType } from '../../../@types/make-recall-decision-api/models/IndeterminateSentenceType'
import { indeterminateSentenceTypeFtr56 } from '../indeterminateSentenceType/formOptions'

jest.mock('../../../utils/errors')
jest.mock('../helpers/urls')

const apiCompatibleIndeterminateSentenceTypes = indeterminateSentenceTypeFtr56.map(({ value, text }) => ({
  value,
  text,
}))

const expectIndeterminatePath = (urlInfo: ReturnType<typeof UrlInfoGenerator.generate>) => {
  expect(nextPagePreservingFromPageAndAnchor).toHaveBeenCalledWith({ pageUrlSlug: 'indeterminate-type', urlInfo })
  expect(nextPageLinkUrl).not.toHaveBeenCalled()
}

const expectNonIndeterminatePath = (
  urlInfo: ReturnType<typeof UrlInfoGenerator.generate>,
  expectedNextPageId: string,
) => {
  expect(nextPageLinkUrl).toHaveBeenCalledWith({ urlInfo, nextPageId: expectedNextPageId })
  expect(nextPagePreservingFromPageAndAnchor).not.toHaveBeenCalled()
}

describe('validateSentenceInformation', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('no previous sentenceGroup value', () => {
    ;[true, false].forEach(isApRationaleRecorded => {
      const testCasesForValidValues = [
        {
          description: `valid Adult SDS sentence group ${isApRationaleRecorded ? 'with' : 'without'} AP rationalerecorded`,
          sentenceGroup: SentenceGroup.ADULT_SDS,
          expectedNextPageId: isApRationaleRecorded ? ppPaths.checkMappaInformation : ppPaths.taskListConsiderRecall,
        },
        {
          description: `valid uth SDS sentence group ${isApRationaleRecorded ? 'with' : 'without'} AP rationalerecorded`,
          sentenceGroup: SentenceGroup.YOUTH_SDS,
          expectedNextPageId: isApRationaleRecorded
            ? 'suitability-for-fixed-term-recall'
            : ppPaths.taskListConsiderRecall,
        },
        {
          description: `valid Extended sentence group ${isApRationaleRecorded ? 'with' : 'without'} AP rationalerecorded`,
          sentenceGroup: SentenceGroup.EXTENDED,
          expectedNextPageId: isApRationaleRecorded ? 'recall-type-extended' : ppPaths.taskListConsiderRecall,
        },
        {
          description: `valid Indeterminate sentence group ${isApRationaleRecorded ? 'with' : 'without'} AP rationalerecorded`,
          sentenceGroup: SentenceGroup.INDETERMINATE,
          expectedNextPageId: ppPaths.indeterminateSentenceType,
        },
      ]
      testCasesForValidValues.forEach(testCase => {
        it(`should return valuesToSave and no errors if ${testCase.description}`, async () => {
          const requestBody = {
            sentenceGroup: testCase.sentenceGroup,
          }
          const urlInfo = UrlInfoGenerator.generate()

          const expectedNextPagePath = faker.internet.url()
          if (testCase.sentenceGroup === SentenceGroup.INDETERMINATE) {
            ;(nextPagePreservingFromPageAndAnchor as jest.Mock).mockReturnValue(expectedNextPagePath)
          } else {
            ;(nextPageLinkUrl as jest.Mock).mockReturnValue(expectedNextPagePath)
          }

          const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateSentenceInformation({
            requestBody,
            urlInfo,
            isApRationaleRecorded,
          })
          expect(errors).toBeUndefined()
          expect(unsavedValues).toBeUndefined()
          if (testCase.sentenceGroup === SentenceGroup.INDETERMINATE) {
            expect(valuesToSave).toEqual({
              sentenceGroup: requestBody.sentenceGroup,
              indeterminateSentenceType: undefined,
            })
            expectIndeterminatePath(urlInfo)
          } else {
            expect(valuesToSave).toEqual({
              sentenceGroup: requestBody.sentenceGroup,
              indeterminateSentenceType: {
                selected: IndeterminateSentenceType.selected.NO,
                allOptions: apiCompatibleIndeterminateSentenceTypes,
              },
            })
            expectNonIndeterminatePath(urlInfo, testCase.expectedNextPageId)
          }
          expect(nextPagePath).toEqual(expectedNextPagePath)
        })
      })
    })
  })

  describe('sentenceGroup value already exists', () => {
    type TestCase = {
      description: string
      previousSentenceGroup: SentenceGroup
      sentenceGroup: SentenceGroup
      expectedValuesToSave: Partial<RecommendationResponse>
      expectedNextPageId: string
      isIndeterminate: boolean
    }

    const emptyAdultSuitabilityCriteria: Partial<RecommendationResponse> = {
      wasReferredToParoleBoard244ZB: null,
      wasRepatriatedForMurder: null,
      isServingSOPCSentence: null,
      isServingDCRSentence: null,
      isChargedWithOffence: null,
      isServingTerroristOrNationalSecurityOffence: null,
      isAtRiskOfInvolvedInForeignPowerThreat: null,
    }

    const emptyYouthSuitabilityCriteria: Partial<RecommendationResponse> = {
      isYouthSentenceOver12Months: null,
      isYouthChargedWithSeriousOffence: null,
    }

    const testCasesForNoChangeInSentenceGroup: TestCase[] = Object.values(SentenceGroup).map(sentenceGroup => ({
      description: `${sentenceGroup} selection unchanged - no data wiping`,
      previousSentenceGroup: sentenceGroup,
      sentenceGroup,
      isIndeterminate: sentenceGroup === SentenceGroup.INDETERMINATE,
      expectedValuesToSave: {
        sentenceGroup,
        indeterminateSentenceType:
          sentenceGroup === SentenceGroup.INDETERMINATE
            ? undefined
            : {
                selected: IndeterminateSentenceType.selected.NO,
                allOptions: apiCompatibleIndeterminateSentenceTypes,
              },
      },
      expectedNextPageId:
        sentenceGroup === SentenceGroup.INDETERMINATE
          ? ppPaths.indeterminateSentenceType
          : ppPaths.taskListConsiderRecall,
    }))

    const testCasesForChangeBetweenSDSGroups: TestCase[] = [SentenceGroup.ADULT_SDS, SentenceGroup.YOUTH_SDS].map(
      previousSentenceGroup => {
        const newSentenceGroup =
          previousSentenceGroup === SentenceGroup.ADULT_SDS ? SentenceGroup.YOUTH_SDS : SentenceGroup.ADULT_SDS
        return {
          description: `sentence group changed from ${previousSentenceGroup} to ${newSentenceGroup} - wipe suitability criteria, is emergency recall, FTR licence conditions and recall type`,
          previousSentenceGroup,
          sentenceGroup: newSentenceGroup,
          isIndeterminate: false,
          expectedValuesToSave: {
            sentenceGroup: newSentenceGroup,
            indeterminateSentenceType: {
              selected: IndeterminateSentenceType.selected.NO,
              allOptions: apiCompatibleIndeterminateSentenceTypes,
            },
            ...(previousSentenceGroup === SentenceGroup.ADULT_SDS
              ? emptyAdultSuitabilityCriteria
              : emptyYouthSuitabilityCriteria),
            isThisAnEmergencyRecall: null,
            fixedTermAdditionalLicenceConditions: null,
            recallType: null,
          } as Partial<RecommendationResponse>,
          expectedNextPageId: ppPaths.taskListConsiderRecall,
        }
      },
    )

    const testCasesForChangeFromSDSToNonSDSGroup: TestCase[] = []
    ;[SentenceGroup.ADULT_SDS, SentenceGroup.YOUTH_SDS].forEach(previousSentenceGroup => {
      ;[SentenceGroup.INDETERMINATE, SentenceGroup.EXTENDED].forEach(newSentenceGroup => {
        testCasesForChangeFromSDSToNonSDSGroup.push({
          description: `sentence group changed from ${previousSentenceGroup} to ${newSentenceGroup} - wipe MAPPA information, suitability criteria, is emergency recall, FTR licence conditions and recall type`,
          previousSentenceGroup,
          sentenceGroup: newSentenceGroup,
          isIndeterminate: newSentenceGroup === SentenceGroup.INDETERMINATE,
          expectedValuesToSave: {
            sentenceGroup: newSentenceGroup,
            indeterminateSentenceType:
              newSentenceGroup === SentenceGroup.INDETERMINATE
                ? null
                : {
                    selected: IndeterminateSentenceType.selected.NO,
                    allOptions: apiCompatibleIndeterminateSentenceTypes,
                  },
            isMappaCategory4: null,
            isMappaLevel2Or3: null,
            ...(previousSentenceGroup === SentenceGroup.ADULT_SDS
              ? emptyAdultSuitabilityCriteria
              : emptyYouthSuitabilityCriteria),
            isThisAnEmergencyRecall: null,
            fixedTermAdditionalLicenceConditions: null,
            recallType: null,
          },
          expectedNextPageId:
            newSentenceGroup === SentenceGroup.INDETERMINATE
              ? ppPaths.indeterminateSentenceType
              : ppPaths.taskListConsiderRecall,
        })
      })
    })

    const testCasesForChangeFromIndeterminateToSDSGroup: TestCase[] = [
      SentenceGroup.ADULT_SDS,
      SentenceGroup.YOUTH_SDS,
    ].map(newSentenceGroup => ({
      description: `sentence group changed from INDETERMINATE to ${newSentenceGroup} - wipe indeterminate & extended sentence questions, is emergency recall and recall type and set indeterminate sentence type to NO`,
      previousSentenceGroup: SentenceGroup.INDETERMINATE,
      sentenceGroup: newSentenceGroup,
      isIndeterminate: false,
      expectedValuesToSave: {
        sentenceGroup: newSentenceGroup,
        indeterminateOrExtendedSentenceDetails: null,
        indeterminateSentenceType: {
          selected: IndeterminateSentenceType.selected.NO,
          allOptions: apiCompatibleIndeterminateSentenceTypes,
        },
        isThisAnEmergencyRecall: null,
        recallType: null,
      } as Partial<RecommendationResponse>,
      expectedNextPageId: ppPaths.taskListConsiderRecall,
    }))

    const testCasesForChangeFromExtendedToSDSGroup: TestCase[] = [SentenceGroup.ADULT_SDS, SentenceGroup.YOUTH_SDS].map(
      newSentenceGroup => ({
        description: `sentence group changed from EXTENDED to ${newSentenceGroup} - wipe indeterminate & extended sentence questions, is emergency recall and recall type and set indeterminate sentence type to NO`,
        previousSentenceGroup: SentenceGroup.EXTENDED,
        sentenceGroup: newSentenceGroup,
        isIndeterminate: false,
        expectedValuesToSave: {
          sentenceGroup: newSentenceGroup,
          indeterminateOrExtendedSentenceDetails: null,
          indeterminateSentenceType: {
            selected: IndeterminateSentenceType.selected.NO,
            allOptions: apiCompatibleIndeterminateSentenceTypes,
          },
          isThisAnEmergencyRecall: null,
          recallType: null,
        } as Partial<RecommendationResponse>,
        expectedNextPageId: ppPaths.taskListConsiderRecall,
      }),
    )

    const testCases: TestCase[] = [
      ...testCasesForNoChangeInSentenceGroup,
      ...testCasesForChangeBetweenSDSGroups,
      ...testCasesForChangeFromSDSToNonSDSGroup,
      ...testCasesForChangeFromIndeterminateToSDSGroup,
      ...testCasesForChangeFromExtendedToSDSGroup,
      {
        description:
          'sentence group changed from INDETERMINATE to EXTENDED - wipe is emergency recall and recall type and set indeterminate sentence type to NO',
        previousSentenceGroup: SentenceGroup.INDETERMINATE,
        sentenceGroup: SentenceGroup.EXTENDED,
        isIndeterminate: false,
        expectedValuesToSave: {
          sentenceGroup: SentenceGroup.EXTENDED,
          indeterminateSentenceType: {
            selected: IndeterminateSentenceType.selected.NO,
            allOptions: apiCompatibleIndeterminateSentenceTypes,
          },
          isThisAnEmergencyRecall: null,
          recallType: null,
        },
        expectedNextPageId: ppPaths.taskListConsiderRecall,
      },
      {
        description:
          'sentence group changed from EXTENDED to INDETERMINATE - wipe indeterminate sentence type, is emergency recall and recall type',
        previousSentenceGroup: SentenceGroup.EXTENDED,
        sentenceGroup: SentenceGroup.INDETERMINATE,
        isIndeterminate: true,
        expectedValuesToSave: {
          sentenceGroup: SentenceGroup.INDETERMINATE,
          indeterminateSentenceType: null,
          isThisAnEmergencyRecall: null,
          recallType: null,
        },
        expectedNextPageId: ppPaths.indeterminateSentenceType,
      },
    ]

    testCases.forEach(testCase => {
      it(testCase.description, async () => {
        const requestBody = {
          previousSentenceGroup: testCase.previousSentenceGroup,
          sentenceGroup: testCase.sentenceGroup,
        }
        const urlInfo = UrlInfoGenerator.generate()
        const expectedNextPagePath = faker.internet.url()

        if (testCase.isIndeterminate) {
          ;(nextPagePreservingFromPageAndAnchor as jest.Mock).mockReturnValue(expectedNextPagePath)
        } else {
          ;(nextPageLinkUrl as jest.Mock).mockReturnValue(expectedNextPagePath)
        }

        const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateSentenceInformation({
          requestBody,
          urlInfo,
          isApRationaleRecorded: false, // not relevant to valuesToSave, the main part of these tests
        })

        expect(errors).toBeUndefined()
        expect(unsavedValues).toBeUndefined()
        expect(valuesToSave).toEqual(testCase.expectedValuesToSave)
        expect(nextPagePath).toEqual(expectedNextPagePath)

        if (testCase.isIndeterminate) {
          expectIndeterminatePath(urlInfo)
        } else {
          expectNonIndeterminatePath(urlInfo, testCase.expectedNextPageId)
        }
      })
    })
  })

  it('should return an error if sentenceGroup is not set', async () => {
    const urlInfo = UrlInfoGenerator.generate()
    const expectedError = NamedFormErrorGenerator.generate()
    ;(makeErrorObject as jest.Mock).mockReturnValue(expectedError)

    const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateSentenceInformation({
      requestBody: {},
      urlInfo,
      isApRationaleRecorded: faker.datatype.boolean(),
    })

    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([expectedError])
    expect(unsavedValues).toEqual({})
    expect(nextPagePath).toBeUndefined()
    expect(makeErrorObject).toHaveBeenCalledWith({
      id: 'sentenceGroup',
      text: 'Select a sentence group',
      errorId: 'missingSentenceGroup',
    })
  })

  it('should return an error if invalid sentenceGroup is set', async () => {
    const requestBody = { sentenceGroup: faker.lorem.word() }
    const urlInfo = UrlInfoGenerator.generate()
    const expectedError = NamedFormErrorGenerator.generate()
    ;(makeErrorObject as jest.Mock).mockReturnValue(expectedError)

    const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateSentenceInformation({
      requestBody,
      urlInfo,
      isApRationaleRecorded: faker.datatype.boolean(),
    })

    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([expectedError])
    expect(unsavedValues).toEqual({ sentenceGroup: requestBody.sentenceGroup })
    expect(nextPagePath).toBeUndefined()
    expect(makeErrorObject).toHaveBeenCalledWith({
      id: 'sentenceGroup',
      text: 'Select a sentence group',
      errorId: 'missingSentenceGroup',
    })
  })
})
