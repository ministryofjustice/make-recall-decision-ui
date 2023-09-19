import { appInsightsEvent } from '../monitoring/azureAppInsights'
import { EVENTS } from '../utils/constants'

export default function raiseWarningBannerEvents(
  numberOfCustodialConvictions: number | undefined,
  hasAllConvictionsReleasedOnLicence: boolean,
  user: { username: string; region: { code: string; name: string } },
  crn: string,
  flags: Record<string, boolean>
) {
  // const numberOfCustodialConvictions = caseSummary?.licenceConvictions?.activeCustodial?.length
  if (numberOfCustodialConvictions > 1) {
    if (hasAllConvictionsReleasedOnLicence) {
      // This person has 2 or more active convictions in NDelius. Double-check that the information in NDelius is correct.
      appInsightsEvent(
        EVENTS.TWO_ACTIVE_CONVICTIONS,
        user.username,
        {
          crn,
          region: user.region,
        },
        flags
      )
    } else {
      // This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.
      appInsightsEvent(
        EVENTS.PERSON_NOT_ON_LICENCE_ACTIVE,
        user.username,
        {
          crn,
          region: user.region,
        },
        flags
      )
    }
  } else if (numberOfCustodialConvictions === 1) {
    if (!hasAllConvictionsReleasedOnLicence) {
      // This person is not on licence in NDelius. Check the throughcare details in NDelius are correct.
      appInsightsEvent(
        EVENTS.PERSON_NOT_ON_LICENCE_NDELIUS,
        user.username,
        {
          crn,
          region: user.region,
        },
        flags
      )
    }
  }
}
