Feature: Recall (determinate)

  Background:
    Given Maria signs in to the case overview for CRN "2"

  Scenario: Not extended / fixed term changed to standard recall
    Given Maria starts a new recommendation
    And Maria explains how the person has responded to probation so far
    And Maria selects the licence conditions that have been breached
    And Maria selects the alternatives to recall that have been tried
    And Maria continues from the Stop and Think page

    And Maria changes the recall type
    And Maria recommends a "Standard" recall
    And Maria confirms "No" for emergency recall
    And Maria reads the guidance on sensitive information
    And Maria confirms the existing custody status
    And Maria clicks Create Part A
    And Maria downloads the Part A and confirms the standard recall
