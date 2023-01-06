import { recommendationStatus } from './recommendationStatus'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'

describe('recommendationStatus', () => {
  it('considering a recall', () => {
    const status = recommendationStatus({
      status: RecommendationResponse.status.RECALL_CONSIDERED,
    })
    expect(status).toEqual('CONSIDERING_RECALL')
  })

  it('recommendation started', () => {
    const status = recommendationStatus({
      status: RecommendationResponse.status.DRAFT,
    })
    expect(status).toEqual('RECOMMENDATION_STARTED')
  })

  it('incomplete recall', () => {
    const status = recommendationStatus({
      status: RecommendationResponse.status.DRAFT,
      recallType: { selected: { value: RecallTypeSelectedValue.value.STANDARD } },
    })
    expect(status).toEqual('MAKING_DECISION_TO_RECALL')
  })

  it('incomplete no recall', () => {
    const status = recommendationStatus({
      status: RecommendationResponse.status.DRAFT,
      recallType: { selected: { value: RecallTypeSelectedValue.value.NO_RECALL } },
    })
    expect(status).toEqual('MAKING_DECISION_NOT_TO_RECALL')
  })

  it('complete recall', () => {
    const status = recommendationStatus({
      status: RecommendationResponse.status.DOCUMENT_DOWNLOADED,
      recallType: { selected: { value: RecallTypeSelectedValue.value.STANDARD } },
    })
    expect(status).toEqual('DECIDED_TO_RECALL')
  })

  it('complete no recall', () => {
    const status = recommendationStatus({
      status: RecommendationResponse.status.DOCUMENT_DOWNLOADED,
      recallType: { selected: { value: RecallTypeSelectedValue.value.NO_RECALL } },
    })
    expect(status).toEqual('DECIDED_NOT_TO_RECALL')
  })

  it('unknown', () => {
    const status = recommendationStatus({})
    expect(status).toEqual('UNKNOWN')
  })
})
