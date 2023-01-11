Feature: Recall (indeterminate)

  Background:
    Given Maria signs in to the case overview for CRN "1" with feature flag "flagConsiderRecall" enabled

  Scenario: Extended sentence changed to non-extended
    Given Maria considers a new recall
    And Maria starts a new recommendation
    And Maria explains how the person has responded to probation so far
    And Maria selects the licence conditions that have been breached
    And Maria selects the alternatives to recall that have been tried
    And Maria cannot continue from the Review with manager page
    And "Maria" signs out
    And "Henry" signs in to the case overview for CRN "1"
    And Henry decides to record a decision
    And Henry chooses a "recall" decision
    And Henry chooses to record the decision in Delius
    And Henry is on "recall" decided confirmation page
    And Henry can view the "recall" decision that they have made
    And "Henry" signs out
    And "Maria" signs in to the case overview for CRN "1"
    And Maria can see the "recall" decision has been decided by a manager on the review screen

#    EXTENDED SENTENCE / EMERGENCY / NOT IN CUSTODY
    And Maria confirms "Yes" for indeterminate sentence
    And Maria confirms "Yes" for extended sentence
    And Maria confirms the person is on a IPP sentence
    And Maria recommends an emergency recall
    And Maria enters indeterminate and extended sentence criteria
    And Maria reads the guidance on sensitive information
    And Maria indicates the person is not in custody
    And Maria views the page Create a Part A form
    And Maria states what has led to the recall
    And Maria selects the vulnerabilities that recall would affect
    And Maria confirms "Yes" to integrated offender management
    And Maria completes local police contact details
    And Maria confirms "Yes" to victim contact scheme
    And Maria enters the date the VLO was informed
    And Maria enters any arrest issues
    And Maria reviews the personal details
    And Maria reviews the offence details
    And Maria enters the offence analysis
    And Maria enters the previous releases
    And Maria reviews the MAPPA details
    And Maria enters an address where the person can be found
    And Maria confirms "Yes" to a risk of contraband
    And Maria clicks Create Part A
    And Maria downloads the Part A and confirms the indeterminate recall