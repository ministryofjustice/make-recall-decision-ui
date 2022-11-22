import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { routeUrls } from '../../../routes/routeUrls'

export const validateOffenceDetails = async ({ recommendationId }: FormValidatorArgs): FormValidatorReturn => {
  return {
    valuesToSave: {
      hasBeenReviewed: {
        convictionDetail: true,
      },
    },
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`,
  }
}
