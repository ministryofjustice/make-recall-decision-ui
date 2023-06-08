@Trigger
Feature: Recommendation Review - SPO

  @MRD-1446 @MRD-1389 @E2E
  Scenario Outline: PO is able to send Recommendation Review to SPO before creating Part A
    Given a PO has created a recommendation to recall with:
      | Indeterminate  | <Indeterminate>  |
      | Extended       | <Extended>       |
      | TypeOfSentence | <TypeOfSentence> |
    And PO has requested an SPO to review recommendation
    And SPO has visited the review link
    And SPO has recorded a review decision of <SPODecision>
    When PO logs back in to update Recommendation
    And PO creates a Part A form with:
      | RecallType          | <RecallType> |
      | InCustody           | <InCustody>  |
      | VictimContactScheme | No           |
    Then the PO task-list has the following status:
      | LineManagerSignature   | To do            |
      | SeniorManagerSignature | Cannot start yet |

    Examples:
      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  | SPODecision |
      | Yes           | No       | LIFE           | EMERGENCY  | Yes Police | RECALL      |
      | Yes           | Yes      | IPP            | EMERGENCY  | No         | RECALL      |
      | No            | Yes      |                | EMERGENCY  | No         | RECALL      |
      | No            | No       |                | STANDARD   | No         | RECALL      |