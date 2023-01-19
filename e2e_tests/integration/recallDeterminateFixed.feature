Feature: Recall (determinate)

  Scenario: Not extended / fixed term
    Given Maria signs in to the case overview for CRN "3"
    And Maria starts a new recommendation
    And Maria continues from the warning page
    And Maria explains how the person has responded to probation so far
    And Maria selects the licence conditions that have been breached
    And Maria selects the alternatives to recall that have been tried
    And Maria continues from the Stop and Think page

#    NOT-EXTENDED SENTENCE / FIXED TERM RECALL / IN PRISON CUSTODY
    And Maria confirms "No" for indeterminate sentence
    And Maria confirms "No" for extended sentence
    And Maria recommends a "Fixed term" recall
    And Maria confirms "No" for emergency recall
    And Maria adds licence conditions for the fixed term recall
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
    And Maria enters no previous releases
    And Maria reviews the MAPPA details
    And Maria enters current RoSH levels
    And Maria clicks Create Part A
    And Maria downloads the Part A and confirms the fixed term recall
    And Maria signs out

  Scenario: SPO signs in
    Given Henry signs in to the case overview for CRN "3"
    And Henry views the Recommendations page
    And Henry downloads the latest Part A and confirms the details have not been overwritten
#
#  Scenario: Not extended / fixed term (with consider recall)
#    Given Maria signs in to the case overview for CRN "3" with feature flag "flagConsiderRecall" enabled
#    And Maria considers a new recall
#    And Maria starts a new recommendation
#    And Maria explains how the person has responded to probation so far
#    And Maria selects the licence conditions that have been breached
#    And Maria selects the alternatives to recall that have been tried
#    And Maria continues from the Stop and Think page
#
##    NOT-EXTENDED SENTENCE / FIXED TERM RECALL / IN PRISON CUSTODY
#    And Maria confirms "No" for indeterminate sentence
#    And Maria confirms "No" for extended sentence
#    And Maria recommends a "Fixed term" recall
#    And Maria confirms "No" for emergency recall
#    And Maria adds licence conditions for the fixed term recall
#    And Maria reads the guidance on sensitive information
#    And Maria confirms the person is in prison custody
#    And Maria views the page Create a Part A form
#    And Maria states what has led to the recall
#    And Maria selects the vulnerabilities that recall would affect
#    And Maria confirms "No" to integrated offender management
#    And Maria confirms "No" to victim contact scheme
#    And Maria confirms "No" to a risk of contraband
#    And Maria confirms the personal details
#    And Maria confirms the offence details
#    And Maria enters the offence analysis
#    And Maria enters the previous releases
#    And Maria reviews the MAPPA details
#    And Maria clicks Create Part A
#    And Maria downloads the Part A and confirms the fixed term recall
