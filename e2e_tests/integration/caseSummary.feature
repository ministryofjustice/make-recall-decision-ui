Feature: Case summary

  Background:
    Given Maria signs in

  Scenario: View case summary
    Given Maria searches for a case
    And Maria views the overview page
    And Maria views the risk page
    And Maria views the personal details page
    And Maria views the licence history page
    And Maria filters contacts by date range