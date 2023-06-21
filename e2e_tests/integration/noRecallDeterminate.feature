Feature: No Recall (determinate)

  Background:
    Given Maria signs in to the case overview for CRN "2" with feature flag "flagTriggerWork" disabled

  Scenario: No recall
    Given Maria starts a new recommendation
    And Maria continues from the warning page
    And Maria explains how the person has responded to probation so far
    And Maria selects the licence conditions that have been breached
    And Maria selects the alternatives to recall that have been tried
    And Maria continues from the Stop and Think page

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