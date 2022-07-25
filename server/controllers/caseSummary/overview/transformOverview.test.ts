import { transformOverview } from './transformOverview'
import caseResponse from '../../../../api/responses/get-case-overview.json'

describe('transformOverview', () => {
  it('should filter convictions to include active ones only', () => {
    const transformed = transformOverview(caseResponse)
    expect(transformed.convictions.active.every(conviction => conviction.active)).toEqual(true)
  })

  it("if convictions doesn't exist, return empty array for active", () => {
    const transformed = transformOverview({ ...caseResponse, convictions: undefined })
    expect(transformed.convictions.active.every(conviction => conviction.active)).toEqual([])
  })
})
