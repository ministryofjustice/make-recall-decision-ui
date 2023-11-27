export type PrisonOffenderSearchResponse = {
  locationDescription: string;
  bookingNo: string;
  facialImageId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  status: string;
  physicalAttributes: {
    gender: string;
    ethnicity: string;
  }
  identifiers: Identifier[],
  image: string
};

export type Identifier = {
  type: string;
  value: string;
}