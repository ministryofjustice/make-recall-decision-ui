import { PpudUserMapping } from '../../../../@types/make-recall-decision-api/models/PpudUserMapping'
import { NamedFormError } from '../../../../@types/pagesForms'
import { getPpudUserMappings } from '../../../../data/makeDecisionApiClient'
import strings from '../../../../textStrings/en'
import { makeErrorObject } from '../../../../utils/errors'

async function validatePpudUserMapping(userMapping: PpudUserMapping, token: string): Promise<NamedFormError[]> {
  const errors: NamedFormError[] = []
  if (!userMapping.userName || userMapping.userName.trim() === '') {
    const errorId = 'missingUserName'
    errors.push(
      makeErrorObject({
        id: 'userName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }
  if (!userMapping.ppudUserFullName || userMapping.ppudUserFullName.trim() === '') {
    const errorId = 'missingPpudUserFullName'
    errors.push(
      makeErrorObject({
        id: 'ppudUserFullName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }
  if (!userMapping.ppudTeamName || userMapping.ppudTeamName.trim() === '') {
    const errorId = 'missingPpudTeamName'
    errors.push(
      makeErrorObject({
        id: 'ppudTeamName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }
  if (!userMapping.ppudUserName || userMapping.ppudUserName.trim() === '') {
    const errorId = 'missingPpudUserName'
    errors.push(
      makeErrorObject({
        id: 'ppudUserName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }
  const allUserMappings = await getPpudUserMappings(token)
  const allOtherUserMappings = userMapping.id
    ? allUserMappings.filter(mapping => mapping.id !== userMapping.id)
    : allUserMappings
  if (allOtherUserMappings.some(mapping => mapping.userName === userMapping.userName)) {
    const errorId = 'duplicateUserName'
    errors.push(
      makeErrorObject({
        id: 'userName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }
  if (allOtherUserMappings.some(mapping => mapping.ppudUserName === userMapping.ppudUserName)) {
    const errorId = 'duplicatePpudUserName'
    errors.push(
      makeErrorObject({
        id: 'ppudUserName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }
  if (allOtherUserMappings.some(mapping => mapping.ppudUserFullName === userMapping.ppudUserFullName)) {
    const errorId = 'duplicatePpudUserFullName'
    errors.push(
      makeErrorObject({
        id: 'ppudUserFullName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }

  return errors
}

export default validatePpudUserMapping
