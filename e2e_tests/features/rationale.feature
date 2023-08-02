Feature: Rationale for a Recall decision

  Non E2E Tests involving rationale flow

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL for non-indeterminate/non-extended only else its EMERGENCY & NO_RECALL
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'

  @MRD-1305 @MRD-1320 @MRD-1449 @MRD-1465
  Scenario: SPO is able to see the ACO countersigning link on SPO countersigning page
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And PO has requested an SPO to countersign
    When SPO visits the countersigning link
    And SPO countersigns without recording rationale with:
      | Telephone | {VALID} |
    Then a confirmation of the countersigning is shown to SPO
    And confirmation page contains a link for ACO to countersign

  @MRD-1465 @MRD-1449
  Scenario: SPO is able to record rationale even after ACO has countersigned
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And PO requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO countersigns without recording rationale
    And SPO requests ACO to countersign
    And ACO visits the countersigning link
    And ACO countersigns
    When SPO logs back in to add rationale
    Then SPO is able to record rationale
    And a confirmation of the decision is shown to SPO
