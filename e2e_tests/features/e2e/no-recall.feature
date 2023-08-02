@E2E @smoke
Feature: E2E Decision Not To Recall scenarios

  Test Scenarios that exercises the System E2E for Decision Not To Recall journey

  Scenario: E2E - Decision Not To Recall Letter details are correct when PO and SPO records rationale during review and countersign
    Given a PO has created a recommendation of no-recall with:
      | Indeterminate  | No |
      | Extended       | No |
    And PO has requested an SPO to review recommendation
    And SPO has visited the review link
    When SPO has recorded a review decision of NO_RECALL
    And PO logs back in to update Recommendation
    And PO confirms the review decision of NO_RECALL
    Then PO can create the Decision Not To Recall letter
    And PO can download the Decision Not To Recall letter
    And Decision Not To Recall letter details are correct
    And the Last Completed Document tab has a link to download the latest DNTR document
