import handleMaintenanceBanner from './maintenanceHandler'
import { mockReq, mockRes } from './testutils/mockRequestUtils'
import config from '../config'

describe('Maintenance banner is hidden or shown based on environment variables', () => {
  it('shows maintenance banner', () => {
    config.notification.active = true
    config.notification.header = 'Scheduled Maintenance'
    config.notification.body =
      'This application will be unavailable between 12.00pm and 2.00pm on September 18th 2023, please save your work ahead of time.'
    const req = mockReq({})
    const res = mockRes()
    const next = jest.fn()
    handleMaintenanceBanner(req, res, next)
    expect(res.locals.notification).toEqual({
      active: true,
      body: 'This application will be unavailable between 12.00pm and 2.00pm on September 18th 2023, please save your work ahead of time.',
      header: 'Scheduled Maintenance',
      isVisible: true,
    })
  })
  it('hides maintenance banner when active is false', () => {
    config.notification.active = false
    config.notification.header = 'Scheduled Maintenance'
    config.notification.body =
      'This application will be unavailable between 12.00pm and 2.00pm on September 18th 2023, please save your work ahead of time.'
    const req = mockReq({})
    const res = mockRes()
    const next = jest.fn()
    handleMaintenanceBanner(req, res, next)
    expect(res.locals.notification).toEqual({
      active: false,
      body: 'This application will be unavailable between 12.00pm and 2.00pm on September 18th 2023, please save your work ahead of time.',
      header: 'Scheduled Maintenance',
      isVisible: false,
    })
  })
  it('hides maintenance banner when body missing', () => {
    config.notification.active = true
    config.notification.header = null
    config.notification.body = null
    const req = mockReq({})
    const res = mockRes()
    const next = jest.fn()
    handleMaintenanceBanner(req, res, next)
    expect(res.locals.notification).toEqual({
      active: true,
      body: null,
      header: null,
      isVisible: null,
    })
  })
})
