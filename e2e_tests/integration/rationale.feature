@Trigger
Feature: Rationale for a Recall decision

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL only
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