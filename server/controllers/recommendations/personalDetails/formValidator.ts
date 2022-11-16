import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { routeUrls } from '../../../routes/routeUrls'

export const validatePersonalDetails = async ({ recommendationId }: FormValidatorArgs): FormValidatorReturn => {
  return {
    valuesToSave: {
      hasBeenReviewed: {
        personOnProbation: true,
      },
    },
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`,
  }
}
