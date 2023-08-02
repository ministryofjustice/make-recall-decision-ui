@smoke
Feature: E2E scenarios - Recall

  Recall Test Scenarios where rationale is recorded in review flow before PO starts the Part A task-list,
  countersigning task list accessed using the link sent by PO

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL for non-indeterminate/non-extended only else its EMERGENCY & NO_RECALL
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'

  @MRD-1446 @MRD-1389
  Scenario Outline: E2E - SPO records rationale during review and countersigns Part A later
    Given a PO has created a recommendation to recall with:
      | Indeterminate  | <Indeterminate>  |
      | Extended       | <Extended>       |
      | TypeOfSentence | <TypeOfSentence> |
    And PO has requested an SPO to review recommendation
    And SPO has visited the review link
    And SPO has recorded a review decision of <SPODecision>
    And PO logs back in to update Recommendation
    And PO creates a Part A form with:
      | RecallType          | <RecallType> |
      | InCustody           | <InCustody>  |
      | VictimContactScheme | No           |
    When PO requests an SPO to countersign
    And SPO visits the countersigning link
    And SPO countersigns after recording rationale in review
    And SPO requests ACO to countersign
    And ACO visits the countersigning link
    And ACO countersigns
    And PO logs back in to update Recommendation
    Then PO can create Part A
    And PO can download Part A
    And Part A details are correct

    Examples:
      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  | SPODecision |
      | Yes           | No       | LIFE           | EMERGENCY  | Yes Police | RECALL      |
      | No            | Yes      |                | EMERGENCY  | No         | RECALL      |