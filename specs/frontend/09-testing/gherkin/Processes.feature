Feature: Processes
  Scenario: Create a process successfully
    Given I am on the Processes page
    When I create a process named "CPU Metrics"
    Then I should see process "CPU Metrics" in the list
