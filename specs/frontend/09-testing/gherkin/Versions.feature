Feature: Versions
  Scenario: Create a version with valid DSL
    Given I have a process named "CPU Metrics"
    And I am editing the process "CPU Metrics"
    When I create a version "v1" with a valid DSL and output schema
    Then I should see version "v1" in the versions list

  Scenario: Version save is blocked when DSL is invalid
    Given I am editing a process version
    When I paste an invalid DSL into "versions.editor.dsl"
    And I click "Save Version"
    Then I should see an error banner "DSL inválida"
