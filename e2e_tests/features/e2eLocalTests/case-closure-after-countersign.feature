Feature: Case closure after SPO/ACO countersign scenario

  Tests covering variation on how and when a recommendation case can be closed

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL for non-indeterminate/non-extended only else its EMERGENCY & NO_RECALL
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'

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