Feature: Case summary

  Background:
    Given Maria signs in

  Scenario: View case summary
    Given Maria searches for a case
    And Maria views the overview page
    And Maria views the personal details page
    And Maria views the licence conditions page
    And Maria views the Contact history page
    And Maria filters contacts by date range
    And Maria starts a new recommendation
    And Maria explains how the person has responded to probation so far
    And Maria selects the licence conditions that have been breached
    And Maria selects the alternatives to recall that have been tried
    And Maria continues from the Stop and Think page
    And Maria confirms the person is not on a determinate sentence
    And Maria confirms the person is on a IPP sentence
    And Maria recommends a standard recall
    And Maria reads the guidance on sensitive information
    And Maria states that it's not an emergency recall
    And Maria indicates the person is not in custody
    And Maria views the page Create a Part A form
    And Maria states what has led to the recall
    And Maria selects the vulnerabilities that recall would affect
    And Maria states that the person is not under integrated offender management
    And Maria completes local police contact details
    And Maria states there are victims in the victim contact scheme
    And Maria enters the date the VLO was informed
    And Maria enters any arrest issues
    And Maria indicates there is a risk of contraband
    Then Maria sees a confirmation page
    And Maria downloads the Part A
    And Maria confirms the recommendation was saved
    And Maria changes custody status to "In police custody"
    And Maria generates an updated Part A