export type OffenderMovement = {
  nomisId: string,
  movementType: string,
  movementTypeDescription: string,
  fromAgency?: string,
  fromAgencyDescription?: string,
  toAgency?: string,
  toAgencyDescription?: string,
  movementDateTime: Date,
}