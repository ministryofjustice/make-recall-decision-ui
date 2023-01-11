Feature: Standard (determinate)

  Background:
    Given Maria signs in to the case overview for CRN "4" with feature flag "flagConsiderRecall" enabled

  Scenario: Not extended / fixed term changed to standard recall
    Given Maria considers a new recall
    And Maria starts a new recommendation
    And Maria explains how the person has responded to probation so far
    And Maria selects the licence conditions that have been breached
    And Maria selects the alternatives to recall that have been tried
    And Maria cannot continue from the Review with manager page
    And "Maria" signs out
    And "Henry" signs in to the case overview for CRN "4"
    And Henry decides to record a decision
    And Henry chooses a "recall" decision
    And Henry chooses to record the decision in Delius
    And Henry is on "recall" decided confirmation page
    And Henry can view the "recall" decision that they have made
    And "Henry" signs out
    And "Maria" signs in to the case overview for CRN "4"
    And Maria can see the "recall" decision has been decided by a manager on the review screen

    And Maria confirms "No" for indeterminate sentence
    And Maria confirms "No" for extended sentence
    And Maria recommends a "Standard" recall
    And Maria confirms "No" for emergency recall
    And Maria reads the guidance on sensitive information
    And Maria confirms the person is in prison custody
    And Maria views the page Create a Part A form
    And Maria states what has led to the recall
    And Maria selects the vulnerabilities that recall would affect
    And Maria confirms "No" to integrated offender management
    And Maria confirms "No" to victim contact scheme
    And Maria confirms "No" to a risk of contraband
    And Maria confirms the personal details
    And Maria confirms the offence details
    And Maria enters the offence analysis
    And Maria enters the previous releases
    And Maria reviews the MAPPA details
    And Maria clicks Create Part A
    And Maria downloads the Part A and confirms the standard recall
