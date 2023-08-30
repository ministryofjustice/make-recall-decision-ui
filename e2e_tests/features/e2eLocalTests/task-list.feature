Feature: Task list

  Tests that check Task-list statuses

  @MRD-1446 @MRD-1389
  Scenario: Countersignature status is correct for PO after they have filled in Part A task list
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has requested an SPO to review recommendation
    And SPO has visited the review link
    And SPO has recorded a review decision of RECALL
    When PO logs back in to update Recommendation
    And PO creates a Part A form with:
      | RecallType          | STANDARD |
      | InCustody           | No       |
      | VictimContactScheme | No       |
    Then the PO task-list has the following status:
      | LineManagerSignature   | To do            |
      | SeniorManagerSignature | Cannot start yet |

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