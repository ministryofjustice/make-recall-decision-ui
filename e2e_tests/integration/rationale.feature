@Rationale
Feature: Rationale for a Recall decision

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

  @MRD-1252 @MRD-1261
  Scenario: PO task-list has the right status for Manager Signature
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    When PO requests an SPO to countersign
    Then the PO task-list has the following status:
      | LineManagerSignature   | Requested        |
      | SeniorManagerSignature | Cannot start yet |

  @MRD-1320 @MRD-1252 @MRD-1449 @MRD-1465
  Scenario: SPO & PO task-lists are updated with right status after SPO countersigning
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And PO requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded rationale
    When SPO countersigns after recording rationale
    Then SPO task-list is updated with the following status:
      | Line manager countersignature   | Completed |
      | Senior manager countersignature | Requested |
    When PO logs back in to view Recommendation
    Then the PO task-list has the following status:
      | LineManagerSignature   | Completed |
      | SeniorManagerSignature | Requested |

  @MRD-1268 @MRD-1252 @MRD-1449 @MRD-1465
  Scenario: ACO & PO task-lists are updated with right status after ACO countersigning
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And PO requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded rationale
    When SPO countersigns after recording rationale
    When SPO requests ACO to countersign
    And ACO visits the countersigning link
    And ACO countersigns
    Then a confirmation of the countersigning is shown to ACO
    And ACO task-list is updated with the following status:
      | Senior manager countersignature | Completed |
      | Line manager countersignature   | Completed |
    When PO logs back in to view Recommendation
    Then the PO task-list has the following status:
      | LineManagerSignature   | Completed |
      | SeniorManagerSignature | Completed |

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

  @MRD-1466
  Scenario: Case is closed when PO downloads Part A after rationale is recorded and SPO/ACO countersigns
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And PO has requested an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded rationale
    And SPO has countersigned after recording rationale
    And SPO has requested ACO to countersign
    And ACO has visited the countersigning link
    And ACO has countersigned
    When PO logs back in to download Part A
    # MRD-1466:AC1
    Then PO can see the case is closed on the Overview page




