import { SessionData } from 'express-session'
import { getStoredSessionData } from './getStoredSessionData'
import { mockReq, mockRes } from './testutils/mockRequestUtils'

describe('store flash errors on request session (middleware)', () => {
  it("doesn't set res.locals.errors if no errors on the request session", () => {
    const req = mockReq({})
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(res.locals.errors).toBeUndefined()
  })

  it('sets res.locals.errors if there are errors on the request session', () => {
    const errors = [
      { name: 'field', href: '#field', text: 'Boom' },
      { name: 'field2', href: '#field2', text: 'Boom2' },
    ]
    const req = mockReq({ session: { errors } as SessionData })
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({})
    expect(res.locals.errors).toEqual({
      field: { href: '#field', text: 'Boom' },
      field2: { href: '#field2', text: 'Boom2' },
      list: [
        { href: '#field', name: 'field', text: 'Boom' },
        {
          href: '#field2',
          name: 'field2',
          text: 'Boom2',
        },
      ],
    })
  })

  it("doesn't set res.locals.unsavedValues if no unsavedValues on the request session", () => {
    const req = mockReq({})
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(res.locals.unsavedValues).toBeUndefined()
  })

  it('sets res.locals.unsavedValues if there are unsavedValues on the request session', () => {
    const errors = [{ name: 'crn', href: '#crn', text: '999' }]
    const unsavedValues = { crn: 'invalid CRN' }
    const req = mockReq({ session: { errors, unsavedValues } as unknown as SessionData })
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({})
    expect(res.locals.unsavedValues).toEqual(unsavedValues)
  })
})
