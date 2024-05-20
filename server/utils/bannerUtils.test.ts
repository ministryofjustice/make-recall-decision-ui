import { createRecommendationBanner } from './bannerUtils'
import { Status } from '../@types/caseSummary'

describe('create recommendation banner', () => {
  const recommendation = {
    createdByUserFullName: 'John Doe',
    createdDate: '2021-01-01',
    personOnProbation: { name: 'Jane Doe' },
  }
  const recommendationId = '12345'

  const baseStatuses: Status[] = [
    { name: 'NO_RECALL_DECIDED', active: true },
    { name: 'RECALL_DECIDED', active: false },
    { name: 'PO_START_RECALL', active: false },
    { name: 'SENT_TO_PPCS', active: false },
  ]

  describe('when NO_RECALL_DECIDED', () => {
    it('should create a banner with correct text and link for an SPO', () => {
      const statuses: Status[] = [
        { ...baseStatuses[0], active: true },
        { ...baseStatuses[3], active: false },
      ]
      const banner = createRecommendationBanner(statuses, recommendation, recommendationId, true)

      expect(banner.display).toBe(true)
      expect(banner.text).toBe('started a decision not to recall letter for')
      expect(banner.linkText).toBe('Delete the decision not to recall')
      expect(banner.dataAnalyticsEventCategory).toBe('spo_delete_dntr_click')
    })

    it('should create a banner with correct text and no link text for a Probation Practitioner', () => {
      const statuses: Status[] = [
        { ...baseStatuses[0], active: true },
        { ...baseStatuses[3], active: false },
      ]
      const banner = createRecommendationBanner(statuses, recommendation, recommendationId, false)

      expect(banner.display).toBe(true)
      expect(banner.text).toBe('started a decision not to recall letter for')
      expect(banner.linkText).toBe('')
    })
  })

  describe('when RECALL_DECIDED', () => {
    it('should create a banner with correct text and link for an SPO', () => {
      const statuses: Status[] = [{ ...baseStatuses[1], active: true }]
      const banner = createRecommendationBanner(statuses, recommendation, recommendationId, true)

      expect(banner.display).toBe(true)
      expect(banner.text).toBe('started a Part A for')
      expect(banner.linkText).toBe('Delete the Part A')
      expect(banner.dataAnalyticsEventCategory).toBe('spo_delete_part_a_click')
    })

    it('should create a banner with correct text and no link text for a Probation Practitioner', () => {
      const statuses: Status[] = [{ ...baseStatuses[1], active: true }]
      const banner = createRecommendationBanner(statuses, recommendation, recommendationId, false)

      expect(banner.display).toBe(true)
      expect(banner.text).toBe('started a Part A for')
      expect(banner.linkText).toBe('')
    })
  })

  describe('when PO_START_RECALL', () => {
    it('should create a banner with correct text and link for an SPO', () => {
      const statuses: Status[] = [{ ...baseStatuses[2], active: true }]
      const banner = createRecommendationBanner(statuses, recommendation, recommendationId, true)

      expect(banner.display).toBe(true)
      expect(banner.text).toBe('started a recommendation for')
      expect(banner.linkText).toBe('Delete the recommendation')
      expect(banner.dataAnalyticsEventCategory).toBe('spo_delete_recommendation_click')
    })

    it('should create a banner with correct text and no link text for a Probation Practitioner', () => {
      const statuses: Status[] = [{ ...baseStatuses[2], active: true }]
      const banner = createRecommendationBanner(statuses, recommendation, recommendationId, false)

      expect(banner.display).toBe(true)
      expect(banner.text).toBe('started a recommendation for')
      expect(banner.linkText).toBe('')
    })
  })

  describe('when there is no active recommendation', () => {
    it('should not display a banner when no relevant statuses are active', () => {
      const statuses: Status[] = [
        { name: 'RECALL_DECIDED', active: false },
        { name: 'PO_START_RECALL', active: false },
      ]
      const banner = createRecommendationBanner(statuses, recommendation, recommendationId, true)

      expect(banner.display).toBe(false)
    })
  })
})
