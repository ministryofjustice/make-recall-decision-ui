

export enum SupportingDocumentType {
  PPUDPartA,
  PPUDLicenceDocument,
  PPUDProbationEmail,
  PPUDOASys,
  PPUDPrecons,
  PPUDPSR,
  PPUDChargeSheet,
  OtherDocument
}

export type SupportingDocument = {
  title: string,
  type: string,
  filename?: string,
  id?: string,
}
