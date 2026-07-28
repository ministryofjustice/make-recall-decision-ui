import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import recommendationUtils from './recommendationUtils'
import RECOMMENDATION_STATUS from '../middleware/recommendationStatus'

describe('hasActiveStatus', () => {
  const mockStatuses: RecommendationStatusResponse[] = [
    {
      name: 'PO_START_RECALL',
      active: true,
      recommendationId: '123',
      createdBy: 'TEST_USER',
      created: '2026-01-01T00:00:00',
      modifiedBy: null,
      modified: null,
      createdByUserFullName: 'User',
      modifiedByUserFullName: null,
      emailAddress: null,
    },
    {
      name: 'AP_COLLECTED_RATIONALE',
      active: false,
      recommendationId: '123',
      createdBy: 'TEST_USER',
      created: '2026-01-01T00:00:00',
      modifiedBy: null,
      modified: null,
      createdByUserFullName: 'User',
      modifiedByUserFullName: null,
      emailAddress: null,
    },
  ]

  it('finds active statuses', () => {
    expect(recommendationUtils.hasActiveStatus(mockStatuses, RECOMMENDATION_STATUS.PO_START_RECALL)).toBeTruthy()
  })

  it('does not find inactive statuses', () => {
    expect(recommendationUtils.hasActiveStatus(mockStatuses, RECOMMENDATION_STATUS.AP_COLLECTED_RATIONALE)).toBeFalsy()
  })

  it('handles the statuses list being empty', () => {
    expect(recommendationUtils.hasActiveStatus([], RECOMMENDATION_STATUS.AP_COLLECTED_RATIONALE)).toBeFalsy()
  })

  it('handles the statuses list being undefined', () => {
    expect(recommendationUtils.hasActiveStatus(undefined, RECOMMENDATION_STATUS.AP_COLLECTED_RATIONALE)).toBeFalsy()
  })
})

describe('isOutOfHoursRecall', () => {
  it('finds an OOH recall', () => {
    expect(
      recommendationUtils.isOutOfHoursRecall([
        {
          name: 'AP_RECORDED_RATIONALE',
          active: true,
          recommendationId: '123',
          createdBy: 'TEST_USER',
          created: '2026-01-01T00:00:00',
          modifiedBy: null,
          modified: null,
          createdByUserFullName: 'User',
          modifiedByUserFullName: null,
          emailAddress: null,
        },
      ]),
    ).toBeTruthy()
  })

  it('does not find an OOH recall', () => {
    expect(
      recommendationUtils.isOutOfHoursRecall([
        {
          name: 'FAKE_STATUS',
          active: true,
          recommendationId: '123',
          createdBy: 'TEST_USER',
          created: '2026-01-01T00:00:00',
          modifiedBy: null,
          modified: null,
          createdByUserFullName: 'User',
          modifiedByUserFullName: null,
          emailAddress: null,
        },
      ]),
    ).toBeFalsy()
  })

  it('handles the status list being empty', () => {
    expect(recommendationUtils.isOutOfHoursRecall([])).toBeFalsy()
  })

  it('handles the status list being undefined', () => {
    expect(recommendationUtils.isOutOfHoursRecall(undefined)).toBeFalsy()
  })
})
