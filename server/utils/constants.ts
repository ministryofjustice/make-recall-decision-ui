export enum EVENTS {
  PERSON_SEARCH_RESULTS = 'mrdPersonSearchResults',
  MRD_RECOMMENDATION_STARTED = 'mrdRecommendationStarted',
  MRD_RECOMMENDATION_PAGE_VIEW = 'mrdRecommendationPageView',
  MRD_NO_PPUD_SEARCH_RESULTS = 'mrdNoPpudSearchResultsPageView',
  MRD_SPO_RATIONALE_SENT = 'mrdSpoRationaleRecorded',
  MRD_SPO_RATIONALE_TASKLIST_ACCESSED = 'mrdSpoTasklistAccessed',
  SPO_COUNTERSIGNATURE = 'mrdSpoCountersignature',
  SENIOR_MANAGER_COUNTERSIGNATURE = 'mrdSrMgrCountersignature',
  MRD_RECALL_TYPE = 'mrdRecallType',
  PART_A_DOCUMENT_DOWNLOADED = 'mrdPartADocumentDownloaded',
  DECISION_NOT_TO_RECALL_LETTER_DOWNLOADED = 'mrdDecisionNotToRecallLetterDownloaded',
  PERSON_NOT_ON_LICENCE_NDELIUS = 'mrdNotOnLicenceNdelius',
  PERSON_NOT_ON_LICENCE_ACTIVE = 'mrdNotOnLicenceActive',
  TWO_ACTIVE_CONVICTIONS = 'mrdTwoActiveConvictions',
  MRD_DELETED_RECOMMENDATION = 'mrdDeletedRecommendation',
  MRD_ADDITIONAL_LICENCE_CONDITIONS_TEXT = 'mrdAdditionalLicenceConditionsText',
  MRD_SEND_CONSIDERATION_RATIONALE_TO_DELIUS = 'mrdSendConsiderationRationaleToDelius',
  BOOKING_ERROR = 'mrdBookingOnToPPUDError',
  BOOKED_ONTO_PPUD = 'mrdBookedOntoPPUD',
}
