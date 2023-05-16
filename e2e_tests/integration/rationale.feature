@Trigger
Feature: Rationale for a Recall decision

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL only
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'

  Scenario: Action Required Banner displayed until SPO records a decision rationale
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And creates a Part A form with:
      | RecallType       | STANDARD               |
      | EmergencyRecall  | No                     |
      | InCustody        | No                     |
#      | VictimContactScheme | No       |
      | PreviousReleases | 10-10-2018             |
      | PreviousRecalls  | 10-11-2018, 10-12-2019 |
    And requests an SPO to countersign
    When SPO visits the countersigning link
    Then they are presented with the "Action Required" banner
#    And the banner is visible until SPO records a decision
#    But user is unable to access the page after decision is recorded

#  Scenario: Action Required Banner displayed until SPO records a decision rationale 2
#    Given a PO has created a recommendation to recall with:
#      | Indeterminate  | Yes  |
#      | Extended       | No   |
#      | TypeOfSentence | LIFE |
#    And creates a Part A form
#    And requests an SPO to countersign
##    When SPO visits the countersigning link
##    Then they are presented with the Action Required banner
##    And the banner is visible until SPO records a decision
##    But user is unable to access the page after decision is recorded
#
#  Scenario: Action Required Banner displayed until SPO records a decision rationale 3
#    Given a PO has created a recommendation to recall with:
#      | Indeterminate | No  |
#      | Extended      | Yes |
#    And creates a Part A form
#    And requests an SPO to countersign
#    When SPO visits the countersigning link
#    Then they are presented with the Action Required banner
#    And the banner is visible until SPO records a decision
#    But user is unable to access the page after decision is recorded