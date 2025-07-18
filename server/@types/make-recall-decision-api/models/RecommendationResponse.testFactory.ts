import { randomUUID } from 'node:crypto'
import { randomInt } from 'crypto'
import { CUSTODY_GROUP } from './ppud/CustodyGroup'
import { BookRecallToPpud, NomisIndexOffence, OfferedOffence, Term } from './RecommendationResponse'
import { randomEnum } from '../../enum.testFactory'

export function nomisIndexOffence(
  {
    selected = randomInt(10000),
    allOptions = [offeredOffence()],
  }: {
    selected?: number,
    allOptions?: OfferedOffence[],
  } = {}): NomisIndexOffence {
  return {
    selected,
    allOptions,
  }
}

export function offeredOffence(
  {
    offenderChargeId = randomInt(10000),
    offenceCode = randomUUID(),
    offenceStatute = randomUUID(),
    offenceDescription = randomUUID(),
    offenceDate = randomUUID(),
    sentenceDate = randomUUID(),
    courtDescription = randomUUID(),
    sentenceStartDate = randomUUID(),
    sentenceEndDate = randomUUID(),
    bookingId = randomInt(10000),
    terms = [term()],
    releaseDate = randomUUID(),
    releasingPrison = randomUUID(),
    licenceExpiryDate = randomUUID(),
  }: {
    offenderChargeId?: number;
    offenceCode?: string;
    offenceStatute?: string;
    offenceDescription?: string;
    offenceDate?: string;
    sentenceDate?: string;
    courtDescription?: string;
    sentenceStartDate?: string;
    sentenceEndDate?: string;
    bookingId?: number;
    terms?: Term[];
    releaseDate?: string;
    releasingPrison?: string;
    licenceExpiryDate?: string;
  } = {}): OfferedOffence {
  return {
    offenderChargeId,
    offenceCode,
    offenceStatute,
    offenceDescription,
    offenceDate,
    sentenceDate,
    courtDescription,
    sentenceStartDate,
    sentenceEndDate,
    bookingId,
    terms,
    releaseDate,
    releasingPrison,
    licenceExpiryDate,
  }
}

export function term(
  {
    years = randomInt(30),
    months = randomInt(12),
    weeks = randomInt(4),
    days = randomInt(30),
    code = randomUUID(),
  }: {
    years?: number,
    months?: number,
    weeks?: number,
    days?: number,
    code?: string,
  } = {},
): Term {
  return {
    years,
    months,
    weeks,
    days,
    code,
  }
}

export function bookRecallToPpud(
  {
    firstNames = randomUUID(),
    lastName = randomUUID(),
    dateOfBirth = randomUUID(),
    prisonNumber = randomUUID(),
    cro = randomUUID(),
    decisionDateTime = randomUUID(),
    receivedDateTime = randomUUID(),
    custodyType = randomUUID(),
    custodyGroup = randomEnum(CUSTODY_GROUP),
    indexOffence = randomUUID(),
    indexOffenceComment = randomUUID(),
    ppudIndeterminateSentenceId = randomUUID(),
    mappaLevel = randomUUID(),
    policeForce = randomUUID(),
    probationArea = randomUUID(),
    sentenceDate = randomUUID(),
    gender = randomUUID(),
    ethnicity = randomUUID(),
    legislationReleasedUnder = randomUUID(),
    legislationSentencedUnder = randomUUID(),
    releasingPrison = randomUUID(),
    minute = randomUUID(),
    currentEstablishment = randomUUID(),
  }: {
    firstNames?: string,
    lastName?: string,
    dateOfBirth?: string,
    prisonNumber?: string,
    cro?: string,
    decisionDateTime?: string,
    receivedDateTime?: string,
    custodyType?: string,
    custodyGroup?: CUSTODY_GROUP,
    indexOffence?: string,
    indexOffenceComment?: string,
    ppudIndeterminateSentenceId?: string,
    mappaLevel?: string,
    policeForce?: string,
    probationArea?: string,
    sentenceDate?: string,
    gender?: string,
    ethnicity?: string,
    legislationReleasedUnder?: string,
    legislationSentencedUnder?: string,
    releasingPrison?: string,
    minute?: string,
    currentEstablishment?: string,
  } = {},
):
  BookRecallToPpud {
  return {
    firstNames,
    lastName,
    dateOfBirth,
    prisonNumber,
    cro,
    decisionDateTime,
    receivedDateTime,
    custodyType,
    custodyGroup,
    indexOffence,
    indexOffenceComment,
    ppudIndeterminateSentenceId,
    mappaLevel,
    policeForce,
    probationArea,
    sentenceDate,
    gender,
    ethnicity,
    legislationReleasedUnder,
    legislationSentencedUnder,
    releasingPrison,
    minute,
    currentEstablishment,
  }
}