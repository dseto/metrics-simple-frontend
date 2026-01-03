Feature: Preview
  Scenario: Run preview transform and see output
    Given I have a process version with valid DSL
    And I am on the Preview page
    When I paste a sample input JSON
    And I click "preview.run"
    Then I should see preview output JSON
    And I should see a CSV preview table
