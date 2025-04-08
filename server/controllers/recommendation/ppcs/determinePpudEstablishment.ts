import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { establishmentMappings, offenderMovements, searchForPrisonOffender } from '../../../data/makeDecisionApiClient'
import { hasValue } from '../../../utils/utils'

export const NOMIS_ESTABLISHMENT_OUT = 'OUT'
export const NOMIS_ESTABLISHMENT_TRANSFER = 'TRN'

export const PPUD_ESTABLISHMENT_NOT_APPLICABLE = 'Not Applicable'

/**
 * Determines the PPUD establishment corresponding to the offender's NOMIS agency ID, accounting for the cases where
 * the offender is OUT or being transferred (TRN).
 */
export const determinePpudEstablishment = async (
  recommendation: RecommendationResponse,
  token: string
): Promise<string> => {
  const nomisAgencyId = recommendation.prisonOffender.agencyId
  if (!hasValue(nomisAgencyId) || nomisAgencyId.length === 0) {
    return ''
  }
  if (nomisAgencyId === NOMIS_ESTABLISHMENT_OUT) {
    return PPUD_ESTABLISHMENT_NOT_APPLICABLE
  }
  if (nomisAgencyId === NOMIS_ESTABLISHMENT_TRANSFER) {
    return getTransferAgencyId(recommendation, token)
  }
  return mapToPpudEstablishment(nomisAgencyId, token)
}

/**
 * Gets the agency ID from the relevant transfer, or an empty value if not applicable
 */
async function getTransferAgencyId(recommendation: RecommendationResponse, token: string) {
  let nomisAgencyId = recommendation.prisonOffender.agencyId

  const latestMovement = await getLatestMovement(recommendation.personOnProbation.nomsNumber, token)

  // An undefined value at this point indicates something is probably going wrong either in Prison API, NOMIS or our
  // connection to them, so the logic beyond this if branch would be unreliable. Instead, we leave the field blank for
  // the user to manually react to the problem. This is only expected to affect a very low number of cases.
  if (latestMovement === undefined) {
    return ''
  }

  if (latestMovement.movementType === NOMIS_ESTABLISHMENT_TRANSFER) {
    nomisAgencyId = latestMovement.toAgency
    if (!hasValue(nomisAgencyId) || nomisAgencyId.length === 0) {
      return ''
    }
    return mapToPpudEstablishment(nomisAgencyId, token)
  }

  // We only take the agency from the latest movement if it's a transfer. If it isn't, it means some other movement
  // has happened since we last checked NOMIS, so we need to back to NOMIS to get the latest data
  if (hasValue(recommendation.personOnProbation.nomsNumber)) {
    return determineLatestOffenderPpudEstablishment(recommendation, token)
  }

  return ''
}

async function getLatestMovement(nomisId: string, token: string) {
  const movements = await offenderMovements(token, nomisId)
  if (movements === undefined || movements.length === 0) {
    return
  }

  movements.sort((movementA, movementB) => (movementA.movementDateTime < movementB.movementDateTime ? -1 : 1))
  return movements[movements.length - 1]
}

/**
 * Get the most up-to-date prison offender record and map its agency ID to a PPUD establishment, ignoring transfer cases
 */
async function determineLatestOffenderPpudEstablishment(recommendation: RecommendationResponse, token: string) {
  const prisonOffender = await searchForPrisonOffender(token, recommendation.personOnProbation.nomsNumber)
  const nomisAgencyId = prisonOffender.agencyId
  if (nomisAgencyId === NOMIS_ESTABLISHMENT_OUT) {
    return PPUD_ESTABLISHMENT_NOT_APPLICABLE
  }
  if (nomisAgencyId === NOMIS_ESTABLISHMENT_TRANSFER) {
    return ''
  }
  return mapToPpudEstablishment(nomisAgencyId, token)
}

async function mapToPpudEstablishment(nomisAgencyId: string, token: string) {
  const establishmentMap = await establishmentMappings(token)
  const ppudEstablishment = establishmentMap.get(nomisAgencyId)
  return hasValue(ppudEstablishment) ? ppudEstablishment : ''
}
