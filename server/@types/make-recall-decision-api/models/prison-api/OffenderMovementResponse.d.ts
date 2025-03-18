export type OffenderMovementResponse = {
  nomisId: string,
  movementType: string,
  movementTypeDescription: string,
  fromAgency?: string,
  fromAgencyDescription?: string,
  toAgency?: string,
  toAgencyDescription?: string,
  movementDateTime: string,
}