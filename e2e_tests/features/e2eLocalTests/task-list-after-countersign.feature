Feature: Task list after countersigning

  Tests that check Task-list statuses after SPO / ACO countersigning

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