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
    And creates a Part A form without requesting SPO review with:
      | RecallType       | STANDARD   |
      | EmergencyRecall  | No         |
      | InCustody        | No         |
      | PreviousReleases | 10-10-2018 |
      | PreviousRecalls  | 10-12-2019 |
    And requests an SPO to countersign
    When SPO visits the countersigning link
    Then they are presented with the "Action required" banner
    And the banner is visible until SPO records a decision

  @MRD-1305 @MRD-1320
  Scenario: SPO is able to see the ACO countersigning link on SPO countersigning page
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And creates a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And requested an SPO to countersign
    When SPO visits the countersigning link
    And SPO records a "RECALL" decision
    And SPO countersigns with:
      | Telephone | {VALID} |
    Then a confirmation of the countersigning is shown to SPO
    And confirmation page contains a link for ACO to countersign

  @MRD-1252 @MRD-1261
  Scenario: PO task-list has the right status for Manager Signature
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And creates a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    When requests an SPO to countersign
    Then the PO task-list has the following status:
      | LineManagerSignature   | Requested        |
      | SeniorManagerSignature | Cannot start yet |

  @MRD-1320
  Scenario: SPO task-list is updated with right status after SPO countersigning
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And creates a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded a "RECALL" decision
    When SPO countersigns
    Then SPO task-list is updated with the following status:
      | Senior manager countersignature | Requested |
      | Line manager countersignature   | Completed |

  @MRD-1268
  Scenario: ACO task-list is updated with right status after ACO countersigning
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And creates a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded a "RECALL" decision
    And SPO has countersigned
    When SPO requests ACO to countersign
    And ACO visits the countersigning link
    And ACO countersigns
    Then a confirmation of the countersigning is shown to ACO
    And ACO task-list is updated with the following status:
      | Senior manager countersignature | Completed |
      | Line manager countersignature   | Completed |

  @E2E @MRD-1320 @MRD-1267 @MRD-1268 @MRD-1305 @MRD-1252
  Scenario Outline: PO records a recall and SPO & ACO countersigns
    Given a PO has created a recommendation to recall with:
      | Indeterminate  | <Indeterminate>  |
      | Extended       | <Extended>       |
      | TypeOfSentence | <TypeOfSentence> |
    And creates a Part A form without requesting SPO review with:
      | RecallType          | <RecallType> |
      | InCustody           | <InCustody>  |
      | VictimContactScheme | No           |
    And requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded a "<SPODecision>" decision
    And a confirmation of the decision is shown to SPO
    And SPO has countersigned
    And a confirmation of the countersigning is shown to SPO
    When SPO requests ACO to countersign
    And ACO visits the countersigning link
    And ACO countersigns
    Then a confirmation of the countersigning is shown to ACO

    Examples:
      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  | SPODecision |
      | No            | No       |                | STANDARD   | Yes Police | RECALL      |
      | No            | No       |                | FIXED_TERM | Yes Prison | RECALL      |
      | Yes           | No       | LIFE           | EMERGENCY  | Yes Police | RECALL      |
      | Yes           | Yes      | IPP            | EMERGENCY  | Yes Police | RECALL      |
      | Yes           | Yes      | DPP            | EMERGENCY  | No         | NO RECALL   |
      | No            | Yes      |                | EMERGENCY  | Yes Prison | RECALL      |
