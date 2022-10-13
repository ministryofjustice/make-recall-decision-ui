import { DateTime } from 'luxon'
import { transformRiskManagementPlan } from './transformRiskManagementPlan'

describe('transformRiskManagementPlan', () => {
  const riskManagementPlan = {
    assessmentStatusComplete: true,
    lastUpdatedDate: '2022-09-24T08:39:00.000Z',
    contingencyPlans: 'Text from contingency plan',
    latestDateCompleted: '2022-10-09T01:02:03.123Z',
    initiationDate: '2022-10-09T01:02:03.123Z',
  }

  describe('lastCompletedAssessmentAtLeastTwentyTwoWeeksOld', () => {
    it('sets flag to true if last assessment is complete and 22 weeks old', () => {
      const moreThanTwentyTwoWeeksAgo = DateTime.now().minus({ week: 22 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        latestDateCompleted: moreThanTwentyTwoWeeksAgo,
      })
      expect(transformed.lastCompletedAssessmentAtLeastTwentyTwoWeeksOld).toEqual(true)
    })

    it('sets flag to false if last assessment is complete and less than 22 weeks old', () => {
      const lessThanTwentyTwoWeeksAgo = DateTime.now().minus({ week: 21 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        latestDateCompleted: lessThanTwentyTwoWeeksAgo,
      })
      expect(transformed.lastCompletedAssessmentAtLeastTwentyTwoWeeksOld).toEqual(false)
    })

    it('sets flag to false if last assessment is incomplete and more than 22 weeks old', () => {
      const lessThanTwentyTwoWeeksAgo = DateTime.now().minus({ week: 23 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        latestDateCompleted: lessThanTwentyTwoWeeksAgo,
      })
      expect(transformed.lastCompletedAssessmentAtLeastTwentyTwoWeeksOld).toEqual(false)
    })

    it('sets flag to false if last assessment is incomplete and less than 22 weeks old', () => {
      const lessThanTwentyTwoWeeksAgo = DateTime.now().minus({ week: 21 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        latestDateCompleted: lessThanTwentyTwoWeeksAgo,
      })
      expect(transformed.lastCompletedAssessmentAtLeastTwentyTwoWeeksOld).toEqual(false)
    })

    it('sets flag to true if last assessment is complete and more than 22 weeks old', () => {
      const moreThanTwentyTwoWeeksAgo = DateTime.now().minus({ week: 23 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        latestDateCompleted: moreThanTwentyTwoWeeksAgo,
      })
      expect(transformed.lastCompletedAssessmentAtLeastTwentyTwoWeeksOld).toEqual(true)
    })

    it('returns unaltered, if assessment complete and missing date', () => {
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        latestDateCompleted: undefined,
      })
      expect(transformed).toEqual({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        latestDateCompleted: undefined,
      })
    })

    it('returns unaltered, if assessment incomplete and missing date', () => {
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        latestDateCompleted: undefined,
      })
      expect(transformed).toEqual({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        latestDateCompleted: undefined,
      })
    })
  })

  describe('recentIncompleteAssessment', () => {
    it('sets flag to true if last assessment is incomplete and more than 22 weeks old', () => {
      const initiationDate = DateTime.now().minus({ week: 23 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        initiationDate,
      })
      expect(transformed.recentIncompleteAssessment).toEqual(true)
    })

    it('sets flag to true if last assessment is incomplete and 22 weeks old', () => {
      const initiationDate = DateTime.now().minus({ week: 22 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        initiationDate,
      })
      expect(transformed.recentIncompleteAssessment).toEqual(true)
    })

    it('sets flag to false if last assessment is complete and more than 22 weeks old', () => {
      const initiationDate = DateTime.now().minus({ week: 22 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        initiationDate,
      })
      expect(transformed.recentIncompleteAssessment).toEqual(false)
    })

    it('sets flag to false if last assessment is complete and less than 22 weeks old', () => {
      const initiationDate = DateTime.now().minus({ week: 21 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        initiationDate,
      })
      expect(transformed.recentIncompleteAssessment).toEqual(false)
    })

    it('sets flag to false if last assessment is incomplete and less than 22 weeks old', () => {
      const initiationDate = DateTime.now().minus({ week: 21 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        initiationDate,
      })
      expect(transformed.recentIncompleteAssessment).toEqual(false)
    })

    it('returns unaltered, if assessment complete and date is missing', () => {
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        initiationDate: undefined,
      })
      expect(transformed).toEqual({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
        initiationDate: undefined,
      })
    })

    it('returns unaltered, if assessment incomplete and date is missing', () => {
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        initiationDate: undefined,
      })
      expect(transformed).toEqual({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
        initiationDate: undefined,
      })
    })
  })
})
