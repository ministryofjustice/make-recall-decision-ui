import raiseWarningBannerEvents from './raiseWarningBannerEvents'
import { appInsightsEvent } from '../monitoring/azureAppInsights'

jest.mock('../monitoring/azureAppInsights')

describe('raiseWarningBannerEvents', () => {
  it('should not raise any events', () => {
    raiseWarningBannerEvents(1, true, { username: 'Bob', region: { code: 'X', name: 'Y' } }, 'ABC123', {})
    expect(appInsightsEvent).not.toHaveBeenCalled()
  })

  it('should raise multiple active convictions warning', () => {
    raiseWarningBannerEvents(
      2,
      true,
      {
        username: 'Dave',
        region: { code: 'N07', name: 'London' },
      },
      'AB1234C',
      { flag: true }
    )
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdTwoActiveConvictions',
      'Dave',
      {
        crn: 'AB1234C',
        region: { code: 'N07', name: 'London' },
      },
      { flag: true }
    )
  })

  it('should raise active conviction possibly not on licence', () => {
    raiseWarningBannerEvents(
      2,
      false,
      {
        username: 'Dave',
        region: { code: 'N07', name: 'London' },
      },
      'AB1234C',
      { flag: true }
    )
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdNotOnLicenceActive',
      'Dave',
      {
        crn: 'AB1234C',
        region: { code: 'N07', name: 'London' },
      },
      { flag: true }
    )
  })

  it('should raise active conviction possibly not on licence', () => {
    raiseWarningBannerEvents(
      1,
      false,
      {
        username: 'Dave',
        region: { code: 'N07', name: 'London' },
      },
      'AB1234C',
      { flag: true }
    )
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdNotOnLicenceNdelius',
      'Dave',
      {
        crn: 'AB1234C',
        region: { code: 'N07', name: 'London' },
      },
      { flag: true }
    )
  })
})
