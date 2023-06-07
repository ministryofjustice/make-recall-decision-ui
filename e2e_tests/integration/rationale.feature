@Rationale
Feature: Rationale for a Recall decision

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL for non-indeterminate/non-extended only else its EMERGENCY & NO_RECALL
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'


# There is no longer a banner that is displayed - the link will take the SPO directly to task-list, and not the spo rationale page.
#  @MRD-1313
#  Scenario: Action Required Banner displayed until SPO records a decision rationale
#    Given a PO has created a recommendation to recall with:
#      | Indeterminate | No |
#      | Extended      | No |
#    And PO has created a Part A form without requesting SPO review with:
#      | RecallType       | STANDARD   |
#      | EmergencyRecall  | No         |
#      | InCustody        | No         |
#      | PreviousReleases | 10-10-2018 |
#      | PreviousRecalls  | 10-12-2019 |
#    And PO requests an SPO to countersign
#    When SPO visits the countersigning link
#    Then SPO is presented with the "Action required" banner
#    And the banner is visible until SPO records a decision

# The link goes to the task list page and not the rationale page. - so SPO will not record a Recall decision if he uses that link.
#  @MRD-1305 @MRD-1320
#  Scenario: SPO is able to see the ACO countersigning link on SPO countersigning page
#    Given a PO has created a recommendation to recall with:
#      | Indeterminate | No |
#      | Extended      | No |
#    And PO has created a Part A form without requesting SPO review with:
#      | RecallType          | STANDARD   |
#      | InCustody           | Yes Police |
#      | VictimContactScheme | No         |
#    And PO has requested an SPO to countersign
#    When SPO visits the countersigning link
#    And SPO records a "RECALL" decision
#    And SPO continues to countersign with:
#      | Telephone | {VALID} |
#    Then a confirmation of the countersigning is shown to SPO
#    And confirmation page contains a link for ACO to countersign

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

#  @MRD-1320 @MRD-1252
#  Scenario: SPO & PO task-lists are updated with right status after SPO countersigning
#    Given a PO has created a recommendation to recall with:
#      | Indeterminate | No |
#      | Extended      | No |
#    And PO has created a Part A form without requesting SPO review with:
#      | RecallType          | STANDARD   |
#      | InCustody           | Yes Police |
#      | VictimContactScheme | No         |
#    And PO requests an SPO to countersign
#    And SPO has visited the countersigning link
#    And SPO has recorded a "RECALL" decision
#    When SPO continues to countersign
#    Then SPO task-list is updated with the following status:
#      | Line manager countersignature   | Completed |
#      | Senior manager countersignature | Requested |
#    When PO logs back in to view Recommendation
#    Then the PO task-list has the following status:
#      | LineManagerSignature   | Completed |
#      | SeniorManagerSignature | Requested |

#  @MRD-1268 @MRD-1252
#  Scenario: ACO & PO task-lists are updated with right status after ACO countersigning
#    Given a PO has created a recommendation to recall with:
#      | Indeterminate | No |
#      | Extended      | No |
#    And PO has created a Part A form without requesting SPO review with:
#      | RecallType          | STANDARD   |
#      | InCustody           | Yes Police |
#      | VictimContactScheme | No         |
#    And PO requests an SPO to countersign
#    And SPO has visited the countersigning link
#    And SPO has recorded a "RECALL" decision
#    And SPO has continued to countersign
#    When SPO requests ACO to countersign
#    And ACO visits the countersigning link
#    And ACO countersigns
#    Then a confirmation of the countersigning is shown to ACO
#    And ACO task-list is updated with the following status:
#      | Senior manager countersignature | Completed |
#      | Line manager countersignature   | Completed |
#    When PO logs back in to view Recommendation
#    Then the PO task-list has the following status:
#      | LineManagerSignature   | Completed |
#      | SeniorManagerSignature | Completed |

#  @E2E @MRD-1320 @MRD-1268 @MRD-1305 @MRD-1252 @MRD-1262 @MRD-1311 @MRD-1276 @MRD-1391 @MRD-1391 @MRD-1327
#  Scenario Outline: PO records a recall and SPO & ACO countersigns - deeplink
#    Given a PO has created a recommendation to recall with:
#      | Indeterminate  | <Indeterminate>  |
#      | Extended       | <Extended>       |
#      | TypeOfSentence | <TypeOfSentence> |
#    And PO has created a Part A form without requesting SPO review with:
#      | RecallType          | <RecallType> |
#      | InCustody           | <InCustody>  |
#      | VictimContactScheme | No           |
#    # MRD-1262: AC0/AC1
#    And PO requests an SPO to countersign
#    And SPO has visited the countersigning link
#    And SPO has recorded a "<SPODecision>" decision
#    And a confirmation of the decision is shown to SPO
#    # MRD-1305: AC3
#    And SPO has continued to countersign
#    And a confirmation of the countersigning is shown to SPO
#    When SPO requests ACO to countersign
#    And ACO visits the countersigning link
#    # MRD-1311: AC0/AC1/AC3/AC4/AC5
#    And ACO countersigns
#    # MRD-1276: AC0/AC1
#    Then a confirmation of the countersigning is shown to ACO
#    When PO logs back in to update Recommendation
#    # MRD-1327: AC1
#    Then PO can create Part A
#    # MRD-1391: AC2
#    And PO can download Part A
#    # MRD-1391: AC1/AC2, MRD-1383: AC1/AC2
#    And Part A details are correct

#    Examples:
#      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  | SPODecision |
#      | No            | No       |                | STANDARD   | No         | RECALL      |
#      | No            | No       |                | FIXED_TERM | Yes Prison | RECALL      |
#      | No            | Yes      |                | EMERGENCY  | Yes Police | RECALL      |
#      | Yes           | No       |                | EMERGENCY  | Yes Prison | RECALL      |

#  @E2E @MRD-1320 @MRD-1268 @MRD-1305 @MRD-1252 @MRD-1267
#  Scenario Outline: PO records a recall and SPO & ACO countersigns - login & search
#    Given a PO has created a recommendation to recall with:
#      | Indeterminate  | <Indeterminate>  |
#      | Extended       | <Extended>       |
#      | TypeOfSentence | <TypeOfSentence> |
#    And PO has created a Part A form without requesting SPO review with:
#      | RecallType          | <RecallType> |
#      | InCustody           | <InCustody>  |
#      | VictimContactScheme | No           |
#    And PO has requested an SPO to countersign
#    And SPO has visited the countersigning link
#    And SPO has recorded a "<SPODecision>" decision
#    And a confirmation of the decision is shown to SPO
#    And SPO logs back in to Countersign
#    And SPO has countersigned
#    And a confirmation of the countersigning is shown to SPO
#    When ACO logs in to Countersign
#    And ACO countersigns
#    Then a confirmation of the countersigning is shown to ACO
#
#    Examples:
#      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  | SPODecision |
#      | Yes           | No       | LIFE           | EMERGENCY  | Yes Police | RECALL      |
#      | Yes           | Yes      | IPP            | EMERGENCY  | Yes Police | RECALL      |
#      | Yes           | Yes      | DPP            | EMERGENCY  | No         | NO RECALL   |