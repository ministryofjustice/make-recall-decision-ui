Feature: Case closure scenarios

  Tests covering different variations on how and when a recommendation case can be closed

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL for non-indeterminate/non-extended only else its EMERGENCY & NO_RECALL
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'

  @MRD-1466
  Scenario: E2E - SPO is able to record rationale and close the case even after PO has downloaded Part A
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
    And PO has logged in and downloaded Part A
    When SPO logs back in to add rationale
    # MRD-1466:AC3,AC5
    Then SPO is able to record rationale
    And a confirmation of the decision is shown to SPO
    And SPO can see the case is closed on the Overview page

  @MRD-1466
  Scenario: E2E - Recommendation is closed when a new recommendation is created before SPO records a rationale
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
    And PO has logged in and downloaded Part A
    When PO creates a new Recommendation for same CRN
    And PO returns to Recommendations page of CRN
    # MRD-1466:AC4
    Then the previous Recommendation should be marked a complete
    And SPO can no longer record rationale