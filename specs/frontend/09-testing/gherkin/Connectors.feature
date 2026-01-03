Feature: Connectors
  Scenario: Create a connector successfully
    Given I am on the Connectors page
    When I click "New Connector"
    And I fill the connector form with valid data
    And I click "Save"
    Then I should see the connector in the connectors list

  Scenario: Validation errors are shown when required fields are missing
    Given I am on the Connectors page
    When I click "New Connector"
    And I click "Save"
    Then I should see validation message for "connectors.form.name"
