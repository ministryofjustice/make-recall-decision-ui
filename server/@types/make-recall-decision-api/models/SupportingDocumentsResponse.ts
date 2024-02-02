

export enum SupportingDocumentType {
  PPUDPartA,
  PPUDLicenceDocument,
  PPUDProbationEmail,
  PPUDOASys,
  PPUDPrecons,
  PPUDPSR,
  PPUDChargeSheet,
  PPUDOther
}

export type SupportingDocument = {
  title: string,
  type: SupportingDocumentType,
  filename?: string,
  id?: string,
}

export type SupportingDocumentsResponse = {
  PPUDPartA: SupportingDocument,
  PPUDLicenceDocument: SupportingDocument,
  PPUDProbationEmail: SupportingDocument,
  PPUDOASys: SupportingDocument,
  PPUDPrecons: SupportingDocument,
  PPUDPSR: SupportingDocument,
  PPUDChargeSheet: SupportingDocument,
  PPUDOthers: SupportingDocument[]
};