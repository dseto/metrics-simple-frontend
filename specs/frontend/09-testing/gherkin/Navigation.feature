Feature: Navigation
  Scenario: User can open the app shell and see main navigation
    Given the app is running
    When I open the home page
    Then I should see the main toolbar
    And I should see navigation items for "Connectors" and "Processes"
