import { PpudUserMappingFull } from '../../../../@types/make-recall-decision-api/models/PpudUserMappingFull'
import { NamedFormError } from '../../../../@types/pagesForms'
import { getPpudUserMappings } from '../../../../data/makeDecisionApiClient'
import strings from '../../../../textStrings/en'
import { makeErrorObject } from '../../../../utils/errors'

async function validatePpudUserMapping(userMapping: PpudUserMappingFull, token: string): Promise<NamedFormError[]> {
  const errors: NamedFormError[] = []
  if (!userMapping.userName || userMapping.userName.trim() === '') {
    const errorId = 'missingUsername'
    errors.push(
      makeErrorObject({
        id: 'userName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }
  if (!userMapping.ppudUserFullName || userMapping.ppudUserFullName.trim() === '') {
    const errorId = 'missingPpudFullName'
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
    const errorId = 'missingPpudUsername'
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
    const errorId = 'duplicateUsername'
    errors.push(
      makeErrorObject({
        id: 'userName',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }
  if (allOtherUserMappings.some(mapping => mapping.ppudUserName === userMapping.ppudUserName)) {
    const errorId = 'duplicatePpudUsername'
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
