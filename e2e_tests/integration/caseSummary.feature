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