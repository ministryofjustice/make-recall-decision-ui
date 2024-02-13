export type PpudUpdateReleaseRequest = {
  dateOfRelease: string,
  postRelease: PpudUpdatePostReleaseRequest,
  releasedFrom: string,
  releasedUnder: string,
};

export type PpudUpdatePostReleaseRequest = {
  assistantChiefOfficer: PpudContact,
  offenderManager: PpudContactWithTelephone,
  probationService: string,
  spoc: PpudContact,
}

export type PpudContact = {
  name: string,
  faxEmail: string,
}

export type PpudContactWithTelephone = {
  name: string,
  faxEmail: string,
  telephone: string,
}
