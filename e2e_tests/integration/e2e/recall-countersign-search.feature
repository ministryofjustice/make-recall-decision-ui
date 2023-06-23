@E2E
Feature: E2E scenarios - Recall

  Recall Test Scenarios where rationale is recorded while SPO is countersigning,
  countersigning task list accessed after searching for CRN

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL for non-indeterminate/non-extended only else its EMERGENCY & NO_RECALL
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'

  @MRD-1320 @MRD-1268 @MRD-1305 @MRD-1252 @MRD-1267 @MRD-1449 @MRD-1465
  Scenario Outline: E2E - PO records a recall and SPO & ACO countersigns - login & search
    Given a PO has created a recommendation to recall with:
      | Indeterminate  | <Indeterminate>  |
      | Extended       | <Extended>       |
      | TypeOfSentence | <TypeOfSentence> |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | <RecallType> |
      | InCustody           | <InCustody>  |
      | VictimContactScheme | No           |
    And PO has requested an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded rationale
    And a confirmation of the decision is shown to SPO
    And SPO has logged back in to Countersign
    And SPO has countersigned
    # MRD-1305: AC3
    And a confirmation of the countersigning is shown to SPO
    When ACO logs in to Countersign
    # MRD-1311: AC0/AC1/AC3/AC4/AC5
    And ACO countersigns
    # MRD-1276: AC0/AC1
    And a confirmation of the countersigning is shown to ACO
    When PO logs back in to update Recommendation
    Then PO can create Part A
    And PO can download Part A
    And Part A details are correct

    Examples:
      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  |
      | Yes           | Yes      | IPP            | EMERGENCY  | Yes Police |
      | Yes           | Yes      | DPP            | EMERGENCY  | No         |
