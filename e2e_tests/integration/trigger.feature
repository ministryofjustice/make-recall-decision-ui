Feature: Recall2 (indeterminate)

  Scenario: Extended sentence changed to non-extended
    When Maria signs in to the case overview for CRN "1" with feature flag "flagTriggerWork" enabled
    When the practitioner clicks on "Make a recommendation"

    Then the page heading contains "Important"
    When the practitioner clicks on button "Continue"

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "What has made you think about recalling Harry Smith?"

    Then the page heading contains "What has made you think about recalling Harry Smith?"
    When the practitioner enters "told a bad joke" for "What has made you think about recalling Harry Smith?"
    And the practitioner clicks on button "Continue"

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "How has Harry Smith responded to probation so far?"

    Then the page heading contains "How has Harry Smith responded to probation so far?"
    When Maria explains how the person has responded to probation so far

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "What licence conditions has Harry Smith breached?"

    Then the page heading contains "What licence conditions has Harry Smith breached?"
    When Maria selects the licence conditions that have been breached

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "What alternatives to recall have been tried already?"

    Then the page heading contains "What alternatives to recall have been tried already?"
    When Maria selects the alternatives to recall that have been tried

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "Is Harry Smith on an indeterminate sentence?"

    Then the page heading contains "Is Harry Smith on an indeterminate sentence?"
    When the practitioner selects the "Yes" radio for "Is Harry Smith on an indeterminate sentence?"
    And the practitioner clicks on button "Continue"

    Then the page heading contains "Is Harry Smith on an extended sentence?"
    When the practitioner selects the "Yes" radio for "Is Harry Smith on an extended sentence?"
    And the practitioner clicks on button "Continue"

    Then the page heading contains "What type of sentence is Harry Smith on?"
    When the practitioner selects the "Imprisonment for Public Protection (IPP) sentence" radio for "What type of sentence is Harry Smith on?"
    And the practitioner clicks on button "Continue"

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on button "Continue"

    Then the page heading contains "Share this case with your manager"
    When the practitioner clicks on "Continue"
    Then the page heading contains "Discuss with your manager"
    When the practitioner clicks on "Sign out"

    When Henry signs in to the case overview for CRN "1" with feature flag "flagTriggerWork" enabled
    When the practitioner clicks on "Consider a recall"

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "Review practitioner's concerns"

    Then the page heading contains "Review practitioner's concerns"
    When the practitioner clicks on button "Continue"

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "Review profile of Harry Smith"

    Then the page heading contains "Overview for Harry Smith"
    When the practitioner clicks on button "Continue"

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "Explain the decision"

    Then the page heading contains "Explain the decision"
    When the practitioner selects the "Recall - standard or fixed term" radio for "Explain the decision"
    And the practitioner enters "just feelin it" for "Explain your decision"
    And the practitioner clicks on button "Continue"

    Then the page heading contains "Consider a recall"
    When the practitioner clicks on "Record the decision"

    Then the page heading contains "Record the decision in NDelius"
    And the practitioner sees "just feelin it"
    When the practitioner clicks on button "Send to NDelius"

    Then the page heading contains "Decision to recall"
    And the page heading contains "What happens next"
    And the practitioner sees "Your decision has been recorded as a contact in NDelius called 'Management oversight - recall' with the outcome 'decision to recall'."
