@Rationale
Feature: Rationale for a Recall decision

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL for non-indeterminate/non-extended only else its EMERGENCY & NO_RECALL
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'

  @MRD-1313
  Scenario: Action Required Banner displayed until SPO records a decision rationale
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And creates a Part A form with:
      | RecallType       | STANDARD   |
      | EmergencyRecall  | No         |
      | InCustody        | No         |
      | PreviousReleases | 10-10-2018 |
      | PreviousRecalls  | 10-12-2019 |
    And requests an SPO to countersign
    When SPO visits the countersigning link
    Then they are presented with the "Action required" banner
    And the banner is visible until SPO records a decision

  @MRD-1305 @MRD-1252
  Scenario Outline: PO records a recall and SPO confirms recalls and countersigns
    Given a PO has created a recommendation to recall with:
      | Indeterminate  | <Indeterminate>  |
      | Extended       | <Extended>       |
      | TypeOfSentence | <TypeOfSentence> |
    And creates a Part A form with:
      | RecallType          | <RecallType> |
      | InCustody           | <InCustody>  |
      | VictimContactScheme | No           |
    And requests an SPO to countersign
    When SPO visits the countersigning link
    And SPO records a "<SPODecision>" decision
    Then a confirmation of the decision is shown to SPO
    And SPO countersigns
    Then a confirmation of the countersigning is shown to SPO

    Examples:
      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  | SPODecision |
      | No            | No       |                | STANDARD   | Yes Police | RECALL      |
      | No            | No       |                | FIXED_TERM | Yes Prison | RECALL      |
      | Yes           | No       | LIFE           | EMERGENCY  | Yes Police | RECALL      |
      | Yes           | Yes      | LIFE           | EMERGENCY  | Yes Police | RECALL      |
      | Yes           | Yes      | IPP            | EMERGENCY  | Yes Police | RECALL      |
      | Yes           | Yes      | DPP            | EMERGENCY  | Yes Police | RECALL      |
      | No            | Yes      |                | EMERGENCY  | Yes Prison | RECALL      |

  Scenario Outline: PO records a recall and SPO recalls/overturns recall
    Given a PO has created a recommendation to recall with:
      | Indeterminate  | <Indeterminate>  |
      | Extended       | <Extended>       |
      | TypeOfSentence | <TypeOfSentence> |
    And creates a Part A form with:
      | RecallType          | <RecallType> |
      | InCustody           | <InCustody>  |
      | VictimContactScheme | No           |
    And requests an SPO to countersign
    When SPO visits the countersigning link
    And SPO records a "<SPODecision>" decision
    Then a confirmation of the decision is shown to SPO

    Examples:
      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  | SPODecision |
      | No            | No       |                | STANDARD   | Yes Prison | NO RECALL   |
      | No            | No       |                | FIXED_TERM | Yes Police | NO RECALL   |
      | Yes           | No       | IPP            | EMERGENCY  | Yes Police | NO RECALL   |
      | Yes           | No       | DPP            | EMERGENCY  | Yes Police | NO RECALL   |
      | Yes           | Yes      | LIFE           | EMERGENCY  | Yes Police | NO RECALL   |
      | No            | Yes      |                | EMERGENCY  | Yes Prison | NO RECALL   |