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

  it("returns the plan unaltered if there's no latestDateCompleted", () => {
    const transformed = transformRiskManagementPlan({
      ...riskManagementPlan,
      latestDateCompleted: null,
    })
    expect(transformed).toEqual({
      ...riskManagementPlan,
      latestDateCompleted: null,
    })
  })

  it("returns the plan unaltered if there's no latestDateCompleted", () => {
    const transformed = transformRiskManagementPlan({
      ...riskManagementPlan,
      latestDateCompleted: 'INVALID DATE',
    })
    expect(transformed).toEqual({
      ...riskManagementPlan,
      latestDateCompleted: 'INVALID DATE',
    })
  })

  describe('lastCompletedAssessmentAtLeastTwentyTwoWeeksOld', () => {
    it('sets flag to true if last assessment is more than 22 weeks old', () => {
      const latestDateCompleted = DateTime.now().minus({ week: 23 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        latestDateCompleted,
      })
      expect(transformed.lastCompletedAssessmentAtLeastTwentyTwoWeeksOld).toEqual(true)
    })

    it('sets flag to true if last assessment 22 weeks old', () => {
      const latestDateCompleted = DateTime.now().minus({ week: 22 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        latestDateCompleted,
      })
      expect(transformed.lastCompletedAssessmentAtLeastTwentyTwoWeeksOld).toEqual(true)
    })

    it('sets flag to false if last assessment is less than 22 weeks old', () => {
      const latestDateCompleted = DateTime.now().minus({ week: 21 }).toISODate()
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        latestDateCompleted,
      })
      expect(transformed.lastCompletedAssessmentAtLeastTwentyTwoWeeksOld).toEqual(false)
    })
  })

  describe('incompleteAssessment', () => {
    it('sets flag to true if last assessment is incomplete', () => {
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: false,
      })
      expect(transformed.incompleteAssessment).toEqual(true)
    })

    it('sets gsldr to true if last assessment is complete', () => {
      const transformed = transformRiskManagementPlan({
        ...riskManagementPlan,
        assessmentStatusComplete: true,
      })
      expect(transformed.incompleteAssessment).toEqual(false)
    })
  })
})
