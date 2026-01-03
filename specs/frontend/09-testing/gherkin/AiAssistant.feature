Feature: AI Assistant
  Scenario: AI disabled shows fallback banner and manual editing remains available
    Given AI is disabled in the environment
    And I am editing a process version
    When I open the AI Assistant panel
    And I click "aiAssistant.generate"
    Then I should see a banner "IA desabilitada"
    And the manual DSL editor should remain enabled
