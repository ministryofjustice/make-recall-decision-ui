import { randomUUID } from 'node:crypto'
import { randomInt } from 'crypto'
import {
  PpudDetailsOffence,
  PpudDetailsOffender,
  PpudDetailsSentence,
  PpudDetailsSentenceLength,
} from '../PpudDetailsResponse'
import { randomDate } from '../../../dates.testFactory'

export function ppudDetailsOffender(
  {
    id = randomUUID(),
    croOtherNumber = randomUUID(),
    dateOfBirth = randomDate(),
    ethnicity = randomUUID(),
    familyName = randomUUID(),
    firstNames = randomUUID(),
    gender = randomUUID(),
    immigrationStatus = randomUUID(),
    establishment = randomUUID(),
    nomsId = randomUUID(),
    prisonerCategory = randomUUID(),
    prisonNumber = randomInt(1000000),
    sentences = [ppudDetailsSentence()],
    status = randomUUID(),
    youngOffender = randomUUID(),
  }: {
    id?: string,
    croOtherNumber?: string,
    dateOfBirth?: Date,
    ethnicity?: string,
    familyName?: string,
    firstNames?: string,
    gender?: string,
    immigrationStatus?: string,
    establishment?: string,
    nomsId?: string,
    prisonerCategory?: string,
    prisonNumber?: number,
    sentences?: PpudDetailsSentence[],
    status?: string,
    youngOffender?: string,
  } = {},
): PpudDetailsOffender {
  return {
    id,
    croOtherNumber,
    dateOfBirth: dateOfBirth.toDateString(),
    ethnicity,
    familyName,
    firstNames,
    gender,
    immigrationStatus,
    establishment,
    nomsId,
    prisonerCategory,
    prisonNumber: prisonNumber.toString(),
    sentences,
    status,
    youngOffender,
  }
}

export function ppudDetailsSentence(
  {
    id = randomUUID(),
    sentenceExpiryDate = randomDate(),
    dateOfSentence = randomDate(),
    custodyType = randomUUID(),
    mappaLevel = randomInt(0, 4),
    licenceExpiryDate = randomDate(),
    offence = ppudDetailsOffence(),
    releaseDate = randomDate(),
    sentenceLength = ppudDetailsSentenceLength(),
    sentencingCourt = randomUUID(),
  }:
    {
      id?: string,
      sentenceExpiryDate?: Date,
      dateOfSentence?: Date,
      custodyType?: string,
      mappaLevel?: number,
      licenceExpiryDate?: Date,
      offence?: PpudDetailsOffence,
      releaseDate?: Date,
      sentenceLength?: PpudDetailsSentenceLength,
      sentencingCourt?: string,
    } = {},
): PpudDetailsSentence {
  return {
    id,
    sentenceExpiryDate: sentenceExpiryDate.toDateString(),
    dateOfSentence: dateOfSentence.toDateString(),
    custodyType,
    mappaLevel: mappaLevel.toString(),
    licenceExpiryDate: licenceExpiryDate.toDateString(),
    offence,
    releaseDate: releaseDate.toDateString(),
    sentenceLength,
    sentencingCourt,
  }
}

export function ppudDetailsOffence(
  {
    indexOffence = randomUUID(),
    dateOfIndexOffence = randomDate(),
  }: {
    indexOffence?: string,
    dateOfIndexOffence?: Date,
  } = {},
): PpudDetailsOffence {
  return {
    indexOffence,
    dateOfIndexOffence: dateOfIndexOffence.toDateString(),
  }
}

export function ppudDetailsSentenceLength(
  {
    partYears = randomInt(0, 40),
    partMonths = randomInt(0, 12),
    partDays = randomInt(0, 30),
  }: {
    partYears?: number,
    partMonths?: number,
    partDays?: number,
  } = {},
): PpudDetailsSentenceLength {
  return {
    partYears,
    partMonths,
    partDays,
  }
}