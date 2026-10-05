Feature: Login and verify start page

  Scenario: A valid user reaches the home page
    Given I am on the login page
    When I log in with valid credentials
    Then I should see the start page
