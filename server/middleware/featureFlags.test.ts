import { readFeatureFlags } from './featureFlags'
import { mockReq, mockRes } from './testutils/mockRequestUtils'

describe('readFeatureFlags', () => {
  it('uses the default if flag not present in request query', () => {
    const req = mockReq()
    const res = mockRes()
    const next = jest.fn()
    readFeatureFlags({ testFlag: true })(req, res, next)
    expect(res.locals.flags).toEqual({
      testFlag: true,
    })
  })

  it('overrides a default of true if flag is "0" in request query', () => {
    const req = mockReq({ query: { testFlag: '0' } })
    const res = mockRes()
    const next = jest.fn()
    readFeatureFlags({ testFlag: true })(req, res, next)
    expect(res.locals.flags).toEqual({
      testFlag: false,
    })
  })

  it('overrides a default of false if flag is "1" in request query', () => {
    const req = mockReq({ query: { testFlag: '1' } })
    const res = mockRes()
    const next = jest.fn()
    readFeatureFlags({ testFlag: false })(req, res, next)
    expect(res.locals.flags).toEqual({
      testFlag: true,
    })
  })
})
