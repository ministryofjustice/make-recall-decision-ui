@E2E @smoke
Feature: E2E scenarios - Recall

  Recall Test Scenarios where rationale is recorded while SPO is countersigning,
  countersigning task list accessed using the link sent by PO

  #NOTE:
  #TypeOfSentence: supports LIFE, IPP & DPP only
  #RecallType: supports STANDARD, FIXED_TERM & NO_RECALL for non-indeterminate/non-extended only else its EMERGENCY & NO_RECALL
  #VictimContactScheme: supports 'Yes', 'No' & 'Not applicable'
  #InCustody: supports 'Yes, prison custody', 'Yes, police custody' & 'No'

  @MRD-1320 @MRD-1268 @MRD-1305 @MRD-1252 @MRD-1262 @MRD-1311
    @MRD-1276 @MRD-1391 @MRD-1391 @MRD-1327 @MRD-1449 @MRD-1465
  Scenario Outline: E2E - PO records a recall while countersigning and SPO & ACO countersigns - deeplink
    Given a PO has created a recommendation to recall with:
      | Indeterminate     | <Indeterminate> |
      | Extended          | <Extended>      |
      | LicenceConditions | All             |
      | AlternativesTried | Some            |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | <RecallType>      |
      | InCustody           | <InCustody>       |
      | VictimContactScheme | Yes               |
      | Vulnerabilities     | <Vulnerabilities> |
      | HasContrabandRisk   | No                |
      | EmergencyRecall     | <EmergencyRecall> |
    # MRD-1262: AC0/AC1
    And PO requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded rationale
    And a confirmation of the decision is shown to SPO
    And SPO countersigns after recording rationale
    # MRD-1305: AC3
    And a confirmation of the countersigning is shown to SPO
    When SPO requests ACO to countersign
    And ACO visits the countersigning link
    # MRD-1311: AC0/AC1/AC3/AC4/AC5
    And ACO countersigns
    # MRD-1276: AC0/AC1
    And a confirmation of the countersigning is shown to ACO
    When PO logs back in to update Recommendation
    # MRD-1327: AC1
    Then PO can create Part A
    # MRD-1391: AC2
    And PO can download Part A
    # MRD-1391: AC1/AC2, MRD-1383: AC1/AC2
    And Part A details are correct
    # MRD-1591
    And the Last Completed Document tab has a link to download the latest Part-A document


    Examples:
      | Indeterminate | Extended | RecallType | InCustody  | Vulnerabilities | EmergencyRecall |
      | No            | No       | STANDARD   | No         | None            |                 |
      | No            | No       | FIXED_TERM | Yes Prison | Some            | Yes             |