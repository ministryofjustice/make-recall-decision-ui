export const NOMIS_ESTABLISHMENT_OUT = 'OUT'
export const NOMIS_ESTABLISHMENT_TRANSFER = 'TRN'

export const PPUD_ESTABLISHMENT_NOT_SPECIFIED = 'Not Specified'
export const PPUD_ESTABLISHMENT_NOT_APPLICABLE = 'Not Applicable'

export const mapEstablishment = (nomisAgencyId: string): string => {
  // TODO in follow-up: take in list of valid establishments and check if PPUD_% constants are valid (will look to
  //      cache PPUD establishments)
  return nomisAgencyId === NOMIS_ESTABLISHMENT_OUT
    ? PPUD_ESTABLISHMENT_NOT_APPLICABLE
    : PPUD_ESTABLISHMENT_NOT_SPECIFIED
}
