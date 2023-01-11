Feature: No Recall (determinate)

  Background:
    Given Maria signs in to the case overview for CRN "2" with feature flag "flagConsiderRecall" enabled

  Scenario: No recall
    Given Maria considers a new recall
    And Maria starts a new recommendation
    And Maria explains how the person has responded to probation so far
    And Maria selects the licence conditions that have been breached
    And Maria selects the alternatives to recall that have been tried
    And Maria cannot continue from the Review with manager page
    And "Maria" signs out
    And "Henry" signs in to the case overview for CRN "2"
    And Henry decides to record a decision
    And Henry chooses a "no recall" decision
    And Henry chooses to record the decision in Delius
    And Henry is on "no recall" decided confirmation page
    And Henry can view the "no recall" decision that they have made
    And "Henry" signs out
    And "Maria" signs in to the case overview for CRN "2"
    And Maria can see the "no recall" decision has been decided by a manager on the review screen

#    NOT-EXTENDED SENTENCE / FIXED TERM RECALL / IN PRISON CUSTODY
    And Maria confirms "No" for indeterminate sentence
    And Maria confirms "No" for extended sentence
    And Maria recommends a "No" recall
    And Maria views the no recall task list
    And Maria confirms why recall was considered
    And Maria confirms why the person should not be recalled
    And Maria enters details of the next appointment
    And Maria previews the decision not to recall letter
    And Maria downloads the decision not to recall letter and confirms the details