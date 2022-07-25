import { transformOverview } from './transformOverview'
import caseResponse from '../../../../api/responses/get-case-overview.json'

describe('transformOverview', () => {
  it('should filter convictions to include active ones only', () => {
    const transformed = transformOverview(caseResponse)
    expect(transformed.convictions.active.every(conviction => conviction.active)).toEqual(true)
  })
})
