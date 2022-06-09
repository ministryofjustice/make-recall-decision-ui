import { readFeatureFlags } from './featureFlags'
import { mockReq, mockRes } from './testutils/mockRequestUtils'

describe('readFeatureFlags', () => {
  it('uses the default if flag not present in request query or cookies', () => {
    const req = mockReq()
    const res = mockRes()
    const next = jest.fn()
    readFeatureFlags({ testFlag: { default: true, label: 'Test' } })(req, res, next)
    expect(res.locals.flags).toEqual({
      testFlag: true,
    })
  })

  it('overrides a default of true if flag is "0" in request query', () => {
    const req = mockReq({ query: { testFlag: '0' } })
    const res = mockRes()
    const next = jest.fn()
    readFeatureFlags({ testFlag: { default: true, label: 'Test' } })(req, res, next)
    expect(res.locals.flags).toEqual({
      testFlag: false,
    })
  })

  it('overrides a default of true if flag is "0" in request cookies', () => {
    const req = mockReq({ cookies: { testFlag: '0' } })
    const res = mockRes()
    const next = jest.fn()
    readFeatureFlags({ testFlag: { default: true, label: 'Test' } })(req, res, next)
    expect(res.locals.flags).toEqual({
      testFlag: false,
    })
  })

  it('uses request query over cookies', () => {
    const req = mockReq({ query: { testFlag: '0' }, cookies: { testFlag: '1' } })
    const res = mockRes()
    const next = jest.fn()
    readFeatureFlags({ testFlag: { default: true, label: 'Test' } })(req, res, next)
    expect(res.locals.flags).toEqual({
      testFlag: false,
    })
  })

  it('overrides a default of false if flag is "1" in request query', () => {
    const req = mockReq({ query: { testFlag: '1' } })
    const res = mockRes()
    const next = jest.fn()
    readFeatureFlags({ testFlag: { default: false, label: 'Test' } })(req, res, next)
    expect(res.locals.flags).toEqual({
      testFlag: true,
    })
  })
})
