import ppcsSearchController from '../../controllers/personSearch/ppcsSearchController'
import ppcsSearchResultsController from '../../controllers/personSearch/ppcsSearchResultsController'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import noPpcsSearchResultsController from '../../controllers/personSearch/noPpcsSearchResultsController'
import type { RouteDefinition } from '../standardRouter'
import {
  defaultRecommendationGetMiddleware,
  defaultRecommendationPostMiddleware,
  recommendationPrefix,
} from '../recommendations'
import searchPpudController from '../../controllers/recommendation/searchPpudController'
import audit from '../../controllers/audit'
import noSearchPpudResults from '../../controllers/recommendation/noSearchPpudResults'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import { and, not, ppcsCustodyGroup, statusIsActive } from '../../middleware/check'
import searchPpudResultsController from '../../controllers/recommendation/searchPpudResultsController'
import checkBookingDetailsController from '../../controllers/recommendation/ppcs/checkBookingDetailsController'
import editPoliceContactController from '../../controllers/recommendation/editPoliceContactController'
import editRecallReceivedController from '../../controllers/recommendation/editRecallReceivedController'
import editPrisonBookingNumberController from '../../controllers/recommendation/editPrisonBookingNumberController'
import editNameController from '../../controllers/recommendation/editNameController'
import editCroController from '../../controllers/recommendation/editCroController'
import editCustodyGroupController from '../../controllers/recommendation/ppcs/custodyGroup/editCustodyGroupController'
import editCurrentEstablishmentController from '../../controllers/recommendation/ppcs/currentEstablishment/editCurrentEstablishmentController'
import editReleasingPrisonController from '../../controllers/recommendation/editReleasingPrisonController'
import editMappaLevelController from '../../controllers/recommendation/editMappaLevelController'
import editGenderController from '../../controllers/recommendation/editGenderController'
import editEthnicityController from '../../controllers/recommendation/editEthnicityController'
import editDateOfBirthController from '../../controllers/recommendation/editDateOfBirthController'
import editProbationAreaController from '../../controllers/recommendation/editProbationAreaController'
import editLegislationReleasedUnderController from '../../controllers/recommendation/editLegislationReleasedUnderController'
import supportingDocumentsController from '../../controllers/recommendation/supportingDocumentsController'
import supportingDocumentUploadController from '../../controllers/recommendation/supportingDocumentUploadController'
import additionalSupportingDocumentUploadController from '../../controllers/recommendation/additionalSupportingDocumentUploadController'
import additionalSupportingDocumentReplaceController from '../../controllers/recommendation/additionalSupportingDocumentReplaceController'
import additionalSupportingDocumentRemoveController from '../../controllers/recommendation/additionalSupportingDocumentRemoveController'
import editPpudMinuteController from '../../controllers/recommendation/editPpudMinuteController'
import supportingDocumentReplaceController from '../../controllers/recommendation/supportingDocumentReplaceController'
import supportingDocumentRemoveController from '../../controllers/recommendation/supportingDocumentRemoveController'
import supportingDocumentDownloadController from '../../controllers/recommendation/supportingDocumentDownloadController'
import { CUSTODY_GROUP } from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import selectIndexOffenceController from '../../controllers/recommendation/ppcs/determinateSentence/selectIndexOffenceController'
import consecutiveSentenceDetailsController from '../../controllers/recommendation/ppcs/determinateSentence/consecutiveSentenceDetailsController'
import matchIndexOffenceController from '../../controllers/recommendation/matchIndexOffenceController'
import selectPpudSentenceController from '../../controllers/recommendation/selectPpudSentenceController'
import editCustodyTypeController from '../../controllers/recommendation/editCustodyTypeController'
import sentenceToCommitController from '../../controllers/recommendation/ppcs/sentenceToCommit/sentenceToCommitController'
import sentenceToCommitExistingOffenderController from '../../controllers/recommendation/ppcs/sentenceToCommit/sentenceToCommitExistingOffenderController'
import selectIndeterminatePpudSentenceController from '../../controllers/recommendation/ppcs/indeterminateSentence/selectIndeterminatePpudSentenceController'
import sentenceToCommitIndeterminateController from '../../controllers/recommendation/ppcs/indeterminateSentence/sentenceToCommitIndeterminateController'
import editReleaseDateController from '../../controllers/recommendation/ppcs/indeterminateSentence/edit/editReleaseDateController'
import editDateOfSentenceController from '../../controllers/recommendation/ppcs/indeterminateSentence/edit/editDateOfSentenceController'
import determinateSentenceDetailsController from '../../controllers/recommendation/ppcs/determinateSentence/determinateSentenceDetailsController'
import retrieveStatuses from '../../controllers/retrieveStatuses'
import retrieveRecommendation from '../../controllers/retrieveRecommendation'
import { guardAgainstModifyingClosedRecommendation } from '../../middleware/guardAgainstModifyingClosedRecommendation'
import { parseRecommendationUrl } from '../../middleware/parseRecommendationUrl'
import customizeMessages from '../../controllers/customizeMessages'
import bookedToPpudController from '../../controllers/recommendation/bookedToPpudController'
import bookToPpudController from '../../controllers/recommendation/bookToPpudController'
import bookingSummaryController from '../../controllers/recommendation/bookingSummaryController'
import editOffenceController from '../../controllers/recommendation/ppcs/indeterminateSentence/edit/editOffenceController'
import editSentencingCourt from '../../controllers/recommendation/ppcs/indeterminateSentence/edit/editSentencingCourt'
import { ppcsPaths } from '../paths/ppcs.paths'

const roles = { allow: [HMPPS_AUTH_ROLE.PPCS] }

const afterSearchMiddleware = [
  retrieveStatuses,
  retrieveRecommendation,
  recommendationStatusCheck(
    and(
      statusIsActive(STATUSES.SENT_TO_PPCS),
      not(statusIsActive(STATUSES.BOOKING_ON_STARTED)),
      not(statusIsActive(STATUSES.REC_CLOSED))
    )
  ),
  parseRecommendationUrl,
  guardAgainstModifyingClosedRecommendation,
  customizeMessages,
]

const ppcsRecommendationRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${ppcsPaths.searchPpud}`,
    method: 'get',
    handler: searchPpudController.get,
    roles,
    additionalMiddleware: [
      retrieveStatuses,
      retrieveRecommendation,
      parseRecommendationUrl,
      guardAgainstModifyingClosedRecommendation,
      customizeMessages,
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.searchPpud}`,
    method: 'post',
    handler: searchPpudController.post,
    roles,
    additionalMiddleware: [retrieveStatuses, retrieveRecommendation, parseRecommendationUrl],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.noSearchPpudResults}`,
    method: 'get',
    handler: noSearchPpudResults.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.searchPpudResults}`,
    method: 'get',
    handler: searchPpudResultsController.get,
    roles,
    additionalMiddleware: [
      retrieveStatuses,
      retrieveRecommendation,
      parseRecommendationUrl,
      guardAgainstModifyingClosedRecommendation,
      customizeMessages,
      ...afterSearchMiddleware,
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.searchPpudResults}`,
    method: 'post',
    handler: searchPpudResultsController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.checkBookingDetails}`,
    method: 'get',
    handler: checkBookingDetailsController.get,
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.checkBookingDetails}`,
    method: 'post',
    handler: checkBookingDetailsController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editPoliceContact}`,
    method: 'get',
    handler: editPoliceContactController.get,
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editPoliceContact}`,
    method: 'post',
    handler: editPoliceContactController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editRecallReceivedDateAndTime}`,
    handler: editRecallReceivedController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editRecallReceivedDateAndTime}`,
    method: 'post',
    handler: editRecallReceivedController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editPrisonBookingNumber}`,
    handler: editPrisonBookingNumberController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editPrisonBookingNumber}`,
    method: 'post',
    handler: editPrisonBookingNumberController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editName}`,
    handler: editNameController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editName}`,
    method: 'post',
    handler: editNameController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editCro}`,
    handler: editCroController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editCro}`,
    method: 'post',
    handler: editCroController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editCustodyGroup}`,
    handler: editCustodyGroupController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editCustodyGroup}`,
    method: 'post',
    handler: editCustodyGroupController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editCurrentEstablishment}`,
    handler: editCurrentEstablishmentController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editCurrentEstablishment}`,
    method: 'post',
    handler: editCurrentEstablishmentController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editReleasingPrison}`,
    handler: editReleasingPrisonController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editReleasingPrison}`,
    method: 'post',
    handler: editReleasingPrisonController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editMappaLevel}`,
    handler: editMappaLevelController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editMappaLevel}`,
    method: 'post',
    handler: editMappaLevelController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editGender}`,
    handler: editGenderController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editGender}`,
    method: 'post',
    handler: editGenderController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editEthnicity}`,
    handler: editEthnicityController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editEthnicity}`,
    method: 'post',
    handler: editEthnicityController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editDateOfBirth}`,
    handler: editDateOfBirthController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editDateOfBirth}`,
    method: 'post',
    handler: editDateOfBirthController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editProbationArea}`,
    handler: editProbationAreaController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editProbationArea}`,
    method: 'post',
    handler: editProbationAreaController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editLegislationReleasedUnder}`,
    handler: editLegislationReleasedUnderController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editLegislationReleasedUnder}`,
    method: 'post',
    handler: editLegislationReleasedUnderController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.supportingDocuments}`,
    handler: supportingDocumentsController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.supportingDocumentUpload}`,
    handler: supportingDocumentUploadController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.supportingDocumentUpload}`,
    method: 'post',
    handler: supportingDocumentUploadController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.additionalSupportingDocumentUpload}`,
    handler: additionalSupportingDocumentUploadController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.additionalSupportingDocumentUpload}`,
    method: 'post',
    handler: additionalSupportingDocumentUploadController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.additionalSupportingDocumentReplace}`,
    handler: additionalSupportingDocumentReplaceController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.additionalSupportingDocumentReplace}`,
    method: 'post',
    handler: additionalSupportingDocumentReplaceController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.additionalSupportingDocumentRemove}`,
    handler: additionalSupportingDocumentRemoveController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.additionalSupportingDocumentRemove}`,
    method: 'post',
    handler: additionalSupportingDocumentRemoveController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editPpudMinute}`,
    handler: editPpudMinuteController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editPpudMinute}`,
    method: 'post',
    handler: editPpudMinuteController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.supportingDocumentReplace}`,
    handler: supportingDocumentReplaceController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.supportingDocumentReplace}`,
    method: 'post',
    handler: supportingDocumentReplaceController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.supportingDocumentRemove}`,
    handler: supportingDocumentRemoveController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.supportingDocumentRemove}`,
    method: 'post',
    handler: supportingDocumentRemoveController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.supportingDocumentDownload}`,
    handler: supportingDocumentDownloadController.get,
    method: 'get',
    roles,
    additionalMiddleware: [...afterSearchMiddleware],
    afterMiddleware: [audit],
  },
]

const determinateSentenceMiddleware = [
  retrieveStatuses,
  retrieveRecommendation,
  recommendationStatusCheck(
    and(
      statusIsActive(STATUSES.SENT_TO_PPCS),
      ppcsCustodyGroup(CUSTODY_GROUP.DETERMINATE),
      not(statusIsActive(STATUSES.BOOKING_ON_STARTED)),
      not(statusIsActive(STATUSES.REC_CLOSED))
    )
  ),
  parseRecommendationUrl,
  guardAgainstModifyingClosedRecommendation,
  customizeMessages,
]

const ppcsDeterminateSentenceRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${ppcsPaths.selectIndexOffence}`,
    method: 'get',
    handler: selectIndexOffenceController.get,
    roles,
    additionalMiddleware: [...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.selectIndexOffence}`,
    method: 'post',
    handler: selectIndexOffenceController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.consecutiveSentenceDetails}`,
    method: 'get',
    handler: consecutiveSentenceDetailsController.get,
    roles,
    additionalMiddleware: [...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.matchIndexOffence}`,
    method: 'get',
    handler: matchIndexOffenceController.get,
    roles,
    additionalMiddleware: [...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.matchIndexOffence}`,
    method: 'post',
    handler: matchIndexOffenceController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.selectPpudSentence}`,
    method: 'get',
    handler: selectPpudSentenceController.get,
    roles,
    additionalMiddleware: [...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.selectPpudSentence}`,
    method: 'post',
    handler: selectPpudSentenceController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editCustodyType}`,
    method: 'get',
    handler: editCustodyTypeController.get,
    roles,
    additionalMiddleware: [...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.editCustodyType}`,
    method: 'post',
    handler: editCustodyTypeController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.sentenceToCommit}`,
    method: 'get',
    handler: sentenceToCommitController.get,
    roles,
    additionalMiddleware: [...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.sentenceToCommit}`,
    method: 'post',
    handler: sentenceToCommitController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.sentenceToCommitExistingOffender}`,
    method: 'get',
    handler: sentenceToCommitExistingOffenderController.get,
    roles,
    additionalMiddleware: [...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.sentenceToCommitExistingOffender}`,
    method: 'post',
    handler: sentenceToCommitExistingOffenderController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...determinateSentenceMiddleware],
    afterMiddleware: [audit],
  },
]

const indeterminateSentenceMiddleware = [
  retrieveStatuses,
  retrieveRecommendation,
  recommendationStatusCheck(
    and(
      statusIsActive(STATUSES.SENT_TO_PPCS),
      ppcsCustodyGroup(CUSTODY_GROUP.INDETERMINATE),
      not(statusIsActive(STATUSES.BOOKING_ON_STARTED)),
      not(statusIsActive(STATUSES.REC_CLOSED))
    )
  ),
  parseRecommendationUrl,
  guardAgainstModifyingClosedRecommendation,
  customizeMessages,
]

const ppcsIndeterminateSentenceRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${ppcsPaths.selectIndeterminatePpudSentence}`,
    method: 'get',
    handler: selectIndeterminatePpudSentenceController.get,
    roles,
    additionalMiddleware: [...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.selectIndeterminatePpudSentence}`,
    method: 'post',
    handler: selectIndeterminatePpudSentenceController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.sentenceToCommitIndeterminate}`,
    method: 'get',
    handler: sentenceToCommitIndeterminateController.get,
    roles,
    additionalMiddleware: [...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.sentenceToCommitIndeterminate}`,
    method: 'post',
    handler: sentenceToCommitIndeterminateController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.indeterminateEdit.releaseDate}`,
    method: 'get',
    handler: editReleaseDateController.get,
    roles,
    additionalMiddleware: [...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.indeterminateEdit.releaseDate}`,
    method: 'post',
    handler: editReleaseDateController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.indeterminateEdit.offenceDescription}`,
    method: 'get',
    handler: editOffenceController.get,
    roles,
    additionalMiddleware: [...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.indeterminateEdit.offenceDescription}`,
    method: 'post',
    handler: editOffenceController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.indeterminateEdit.sentencingCourt}`,
    method: 'get',
    handler: editSentencingCourt.get,
    roles,
    additionalMiddleware: [...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.indeterminateEdit.sentencingCourt}`,
    method: 'post',
    handler: editSentencingCourt.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.indeterminateEdit.dateOfSentence}`,
    method: 'get',
    handler: editDateOfSentenceController.get,
    roles,
    additionalMiddleware: [...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.indeterminateEdit.dateOfSentence}`,
    method: 'post',
    handler: editDateOfSentenceController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.determinatePpudSentences}`,
    method: 'get',
    handler: determinateSentenceDetailsController.get,
    roles,
    additionalMiddleware: [...indeterminateSentenceMiddleware],
    afterMiddleware: [audit],
  },
]

const bookingMiddleware = [
  retrieveStatuses,
  retrieveRecommendation,
  recommendationStatusCheck(and(statusIsActive(STATUSES.SENT_TO_PPCS), not(statusIsActive(STATUSES.REC_CLOSED)))),
  parseRecommendationUrl,
  guardAgainstModifyingClosedRecommendation,
  customizeMessages,
]

const ppcsBookingRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${ppcsPaths.bookToPpud}`,
    method: 'get',
    handler: bookToPpudController.get,
    roles,
    additionalMiddleware: bookingMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.bookToPpud}`,
    method: 'post',
    handler: bookToPpudController.post,
    roles,
    additionalMiddleware: bookingMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.bookingSummary}`,
    method: 'get',
    handler: bookingSummaryController.get,
    roles,
    additionalMiddleware: bookingMiddleware,
    afterMiddleware: [audit],
  },
]

export const ppcsRoutes: RouteDefinition[] = [
  {
    path: `/${ppcsPaths.search}`,
    method: 'get',
    handler: ppcsSearchController.get,
    roles,
    additionalMiddleware: [],
  },
  {
    path: `/${ppcsPaths.searchResults}`,
    method: 'get',
    handler: ppcsSearchResultsController.get,
    roles,
    additionalMiddleware: [],
  },
  {
    path: `/${ppcsPaths.noSearchResults}`,
    method: 'get',
    handler: noPpcsSearchResultsController.get,
    roles,
    additionalMiddleware: [],
  },
  {
    path: `${recommendationPrefix}/${ppcsPaths.bookedToPpud}`,
    method: 'get',
    handler: bookedToPpudController.get,
    roles,
    additionalMiddleware: [
      retrieveStatuses,
      retrieveRecommendation,
      recommendationStatusCheck(statusIsActive(STATUSES.BOOKED_TO_PPUD)),
      parseRecommendationUrl,
      guardAgainstModifyingClosedRecommendation,
      customizeMessages,
    ],
    afterMiddleware: [audit],
  },
  ...ppcsRecommendationRoutes,
  ...ppcsDeterminateSentenceRoutes,
  ...ppcsIndeterminateSentenceRoutes,
  ...ppcsBookingRoutes,
]
