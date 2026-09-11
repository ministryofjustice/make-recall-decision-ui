/**
 * All paths/routes which are scoped to PPCS users
 */

export default {
  search: 'ppcs-search',
  searchResults: 'ppcs-search-results',
  noSearchResults: 'no-ppcs-search-results',
  areOffenceChangesNeeded: 'are-offence-changes-needed',

  ppudUserMappings: 'ppud-user-mappings',

  // determinate
  selectIndexOffence: 'select-index-offence',
  consecutiveSentenceDetails: 'consecutive-sentence-details',
  matchIndexOffence: 'match-index-offence',
  editCustodyType: 'custody-type',
  sentenceToCommit: 'sentence-to-commit',

  // TODO change to select-determinate-ppud-sentence
  selectPpudSentence: 'select-ppud-sentence',
  sentenceToCommitExistingOffender: 'sentence-to-commit-existing-offender',

  // indeterminate
  selectIndeterminatePpudSentence: 'select-indeterminate-ppud-sentence',
  determinatePpudSentences: 'determinate-ppud-sentences',
  sentenceToCommitIndeterminate: 'sentence-to-commit-indeterminate',
  indeterminateEdit: {
    releaseDate: 'edit-release-date',
    dateOfSentence: 'edit-date-of-sentence',
    offenceDescription: 'edit-offence',
    sentencingCourt: 'edit-sentencing-court',
  },

  // recommendation routes
  searchPpud: 'search-ppud',
  noSearchPpudResults: 'no-search-ppud-results',
  searchPpudResults: 'search-ppud-results',
  checkBookingDetails: 'check-booking-details',
  editPoliceContact: 'edit-police-contact',
  editRecallReceivedDateAndTime: 'edit-recall-received-date-and-time',
  editPrisonBookingNumber: 'edit-prison-booking-number',
  editName: 'edit-name',
  editCro: 'edit-cro',
  editCustodyGroup: 'edit-custody-group',
  editCurrentEstablishment: 'edit-current-establishment',
  editReleasingPrison: 'edit-releasing-prison',
  editMappaLevel: 'edit-mappa-level',
  editGender: 'edit-gender',
  editEthnicity: 'edit-ethnicity',
  editDateOfBirth: 'edit-date-of-birth',
  editProbationArea: 'edit-probation-area',
  editLegislationReleasedUnder: 'edit-legislation-released-under',
  supportingDocuments: 'supporting-documents',
  addMinute: 'add-minute',
  bookedToPpud: 'booked-to-ppud',
  bookToPpud: 'book-to-ppud',
  bookedToPpudFail: 'booked-to-ppud-fail',
  bookedToPpudSuccess: 'booked-to-ppud-success',
  bookingSummary: 'booking-summary',
}
