@Rationale @E2E
Feature: E2E scenarios

  Test Scenarios that exercises the System E2E

  @MRD-1446 @MRD-1389
  Scenario Outline: E2E - Part A details are correct when SPO records rationale during review and countersigns Part A later
    Given a PO has created a recommendation to recall with:
      | Indeterminate  | <Indeterminate>  |
      | Extended       | <Extended>       |
      | TypeOfSentence | <TypeOfSentence> |
    And PO has requested an SPO to review recommendation
    And SPO has visited the review link
    And SPO has recorded a review decision of <SPODecision>
    And PO logs back in to update Recommendation
    And PO creates a Part A form with:
      | RecallType          | <RecallType> |
      | InCustody           | <InCustody>  |
      | VictimContactScheme | No           |
    When PO requests an SPO to countersign
    And SPO visits the countersigning link
    And SPO countersigns after recording rationale in review
    And SPO requests ACO to countersign
    And ACO visits the countersigning link
    # MRD-1311: AC0/AC1/AC3/AC4/AC5
    And ACO countersigns
    And PO logs back in to update Recommendation
    # MRD-1327: AC1
    Then PO can create Part A
    # MRD-1391: AC2
    And PO can download Part A
    # MRD-1391: AC1/AC2, MRD-1383: AC1/AC2
    And Part A details are correct

    Examples:
      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  | SPODecision |
      | Yes           | No       | LIFE           | EMERGENCY  | Yes Police | RECALL      |
      | No            | Yes      |                | EMERGENCY  | No         | RECALL      |

  @focus
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
    Then a confirmation of the countersigning is shown to ACO
    When PO logs back in to update Recommendation
    # MRD-1327: AC1
    Then PO can create Part A
    # MRD-1391: AC2
    And PO can download Part A
    # MRD-1391: AC1/AC2, MRD-1383: AC1/AC2
    And Part A details are correct

    Examples:
      | Indeterminate | Extended | RecallType | InCustody  | Vulnerabilities |
      | No            | No       | STANDARD   | No         | None            |
      | No            | No       | FIXED_TERM | Yes Prison | Some            |

  @MRD-1320 @MRD-1268 @MRD-1305 @MRD-1252 @MRD-1267 @MRD-1449 @MRD-1465
  Scenario Outline: E2E - PO records a recall and SPO & ACO countersigns - login & search
    Given a PO has created a recommendation to recall with:
      | Indeterminate  | <Indeterminate>  |
      | Extended       | <Extended>       |
      | TypeOfSentence | <TypeOfSentence> |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | <RecallType> |
      | InCustody           | <InCustody>  |
      | VictimContactScheme | No           |
    And PO has requested an SPO to countersign
    And SPO has visited the countersigning link
    And SPO has recorded rationale
    And a confirmation of the decision is shown to SPO
    And SPO has logged back in to Countersign
    And SPO has countersigned
    # MRD-1305: AC3
    And a confirmation of the countersigning is shown to SPO
    When ACO logs in to Countersign
    # MRD-1311: AC0/AC1/AC3/AC4/AC5
    And ACO countersigns
    # MRD-1276: AC0/AC1
    Then a confirmation of the countersigning is shown to ACO

    Examples:
      | Indeterminate | Extended | TypeOfSentence | RecallType | InCustody  |
      | Yes           | Yes      | IPP            | EMERGENCY  | Yes Police |
      | Yes           | Yes      | DPP            | EMERGENCY  | No         |

  @MRD-1466
  Scenario: E2E - SPO is able to record rationale and close the case even after PO has downloaded Part A
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And PO requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO countersigns without recording rationale
    And SPO requests ACO to countersign
    And ACO visits the countersigning link
    And ACO countersigns
    And PO has logged in and downloaded Part A
    When SPO logs back in to add rationale
    # MRD-1466:AC3,AC5
    Then SPO is able to record rationale
    And a confirmation of the decision is shown to SPO
    And SPO can see the case is closed on the Overview page

  @MRD-1466
  Scenario: E2E - Recommendation is closed when a new recommendation is created before SPO records a rationale
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has created a Part A form without requesting SPO review with:
      | RecallType          | STANDARD   |
      | InCustody           | Yes Police |
      | VictimContactScheme | No         |
    And PO requests an SPO to countersign
    And SPO has visited the countersigning link
    And SPO countersigns without recording rationale
    And SPO requests ACO to countersign
    And ACO visits the countersigning link
    And ACO countersigns
    And PO has logged in and downloaded Part A
    When PO creates a new Recommendation for same CRN
    And PO returns to Recommendations page of CRN
    # MRD-1466:AC4
    Then the previous Recommendation should be marked a complete
    And SPO can no longer record rationale