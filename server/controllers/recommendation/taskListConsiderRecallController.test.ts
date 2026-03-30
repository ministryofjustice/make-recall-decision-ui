import { faker } from '@faker-js/faker/locale/en_GB'
import taskListConsiderRecallController from './taskListConsiderRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import {
  RecommendationOptions,
  RecommendationResponseGenerator,
} from '../../../data/recommendations/recommendationGenerator'
import generateBooleanCombinations from '../../testUtils/booleanUtils'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import randomEnum from '../../@types/enum.testFactory'

jest.mock('../../data/makeDecisionApiClient')

function checkTestCaseCombination(
  testCaseOptions: RecommendationOptions,
  testCaseBooleanCombination: Array<boolean>,
  ftr56Enabled: boolean,
  expectedAllTasksCompleted: boolean = testCaseBooleanCombination.every(value => value),
) {
  const testCaseOptionsNames = Object.getOwnPropertyNames(testCaseOptions)
  let valuesNotSet: string
  let valuesSet: string
  testCaseBooleanCombination.forEach((optionValue, index) => {
    if (optionValue) {
      valuesSet = valuesSet ? `${valuesSet}, ${testCaseOptionsNames[index]}` : testCaseOptionsNames[index]
    } else {
      valuesNotSet = valuesNotSet ? `${valuesNotSet}, ${testCaseOptionsNames[index]}` : testCaseOptionsNames[index]
    }
  })

  let description: string
  if (!valuesSet) {
    description = `load with no values set`
  } else if (!valuesNotSet) {
    description = `load with values set for all options`
  } else {
    description = `load with values set for ${valuesSet} and values not set for ${valuesNotSet}`
  }
  it(description, async () => {
    const recommendationWithNoTasksCompleted = RecommendationResponseGenerator.generate(testCaseOptions)
    const res = mockRes({
      locals: {
        recommendation: recommendationWithNoTasksCompleted,
        flags: { flagFTR56Enabled: ftr56Enabled },
      },
    })
    const next = mockNext()
    await taskListConsiderRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskListConsiderRecall' })
    expect(res.locals.flagFTR56Enabled).toEqual(ftr56Enabled)
    expect(res.locals.isIndeterminateSentence).toEqual(
      recommendationWithNoTasksCompleted.sentenceGroup === SentenceGroup.INDETERMINATE,
    )
    if (ftr56Enabled) {
      expect(res.locals.backLinkUrl).toEqual(`/cases/${recommendationWithNoTasksCompleted.crn}/overview`)
    }
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskListConsiderRecall')

    testCaseOptionsNames.forEach((optionName, index) => {
      const completedFlagName = `${optionName}Completed`
      if (testCaseBooleanCombination[index]) {
        expect(res.locals[completedFlagName]).toBeTruthy()
      } else {
        expect(res.locals[completedFlagName]).toBeFalsy()
      }
    })

    if (expectedAllTasksCompleted) {
      expect(res.locals.allTasksCompleted).toBeTruthy()
    } else {
      expect(res.locals.allTasksCompleted).toBeFalsy()
    }

    expect(next).toHaveBeenCalled()
  })
}

describe('Task List Consider a Recall Controller', () => {
  describe('get', () => {
    describe('with FTR56 flag enabled', () => {
      describe('non-indeterminate sentence group', () => {
        generateBooleanCombinations(5)
          // we generate 2^5 and filter instead of generating 2^4 so that checkTestCaseCombination displays and
          // considers indeterminateSentenceType in its logic too (it uses the combination array for this)
          .filter(combination => !combination[4])
          .forEach(testCaseBooleanCombination => {
            const testCaseOptions: RecommendationOptions = {
              triggerLeadingToRecall: testCaseBooleanCombination[0],
              licenceConditionsBreached: testCaseBooleanCombination[1],
              alternativesToRecallTried: testCaseBooleanCombination[2],
              sentenceGroup: testCaseBooleanCombination[3]
                ? randomEnum(SentenceGroup, [SentenceGroup.INDETERMINATE]) // deal with Indeterminate separately
                : 'none',
              indeterminateSentenceType: false,
            }
            checkTestCaseCombination(
              testCaseOptions,
              testCaseBooleanCombination,
              true,
              // the indeterminate sentence type boolean is irrelevant for non-indeterminate
              // sentence groups, so only the first 4 tasks need to be completed
              testCaseBooleanCombination.slice(0, 4).every(value => value),
            )
          })
      })
      describe('indeterminate sentence group', () => {
        generateBooleanCombinations(5)
          // we generate 2^5 and filter instead of generating 2^4 so that checkTestCaseCombination displays and
          // considers indeterminateSentenceType in its logic too (it uses the combination array for this)
          .filter(combination => combination[4])
          .forEach(testCaseBooleanCombination => {
            const testCaseOptions: RecommendationOptions = {
              triggerLeadingToRecall: testCaseBooleanCombination[0],
              licenceConditionsBreached: testCaseBooleanCombination[1],
              alternativesToRecallTried: testCaseBooleanCombination[2],
              indeterminateSentenceType: testCaseBooleanCombination[3],
              sentenceGroup: SentenceGroup.INDETERMINATE,
            }
            checkTestCaseCombination(testCaseOptions, testCaseBooleanCombination, true)
          })
      })
    })

    describe('with FTR56 flag disabled', () => {
      generateBooleanCombinations(6).forEach(testCaseBooleanCombination => {
        const testCaseOptions: RecommendationOptions = {
          triggerLeadingToRecall: testCaseBooleanCombination[0],
          responseToProbation: testCaseBooleanCombination[1],
          licenceConditionsBreached: testCaseBooleanCombination[2],
          alternativesToRecallTried: testCaseBooleanCombination[3],
          isIndeterminateSentence: testCaseBooleanCombination[4] ? faker.datatype.boolean() : 'none',
          isExtendedSentence: testCaseBooleanCombination[5] ? faker.datatype.boolean() : 'none',
        }
        checkTestCaseCombination(testCaseOptions, testCaseBooleanCombination, false)
      })
    })
  })

  describe('post', () => {
    it('post with statuses', async () => {
      ;(getStatuses as jest.Mock).mockResolvedValue([
        {
          name: STATUSES.SPO_CONSIDER_RECALL,
          active: true,
          recommendationId: 123,
          createdBy: 'MAKE_RECALL_DECISION_SPO_USER',
          created: '2023-04-13T10:52:11.624Z',
          modifiedBy: null,
          modified: null,
          createdByUserFullName: 'Making Recall Decisions SPO User',
          modifiedByUserFullName: null,
        },
        {
          name: STATUSES.PO_RECALL_CONSULT_SPO,
          active: true,
          recommendationId: 123,
          createdBy: 'MAKE_RECALL_DECISION_SPO_USER',
          created: '2023-04-13T10:52:11.624Z',
          modifiedBy: null,
          modified: null,
          createdByUserFullName: 'Making Recall Decisions SPO User',
          modifiedByUserFullName: null,
        },
      ])

      const req = mockReq({
        params: { recommendationId: '123' },
      })

      const res = mockRes({
        token: 'token1',
        locals: {
          urlInfo: { basePath: '/recommendation/123/' },
        },
      })
      const next = mockNext()

      await taskListConsiderRecallController.post(req, res, next)

      expect(getStatuses).toHaveBeenCalledWith({
        recommendationId: '123',
        token: 'token1',
      })

      expect(updateStatuses).not.toHaveBeenCalled()

      expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/record-consideration-rationale`)
      expect(next).not.toHaveBeenCalled() // end of the line for posts.
    })
  })
})
