Feature: Contact Information section on the Task List

  Contact Information is present on Part A Task List

  @MRD-1723 @MRD-1731 @MRD-1756
  Scenario: Contact information section is present when PO tries to complete Part A task list
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has started creating the Part A form without requesting SPO review
    And the probation admin flag is turned on
    When PO has updated "Who completed this Part A?" under Contact Information section
    And PO has updated "Where should the revocation order be sent?" under Contact Information section
    And PO has updated "Where should the PPCS respond with questions?" under Contact Information section
    Then the PO task-list has the following status:
      | WhoCompletedPartA      | Completed |
      | PractitionerForPartA   | Completed |
      | RevocationContact      | Completed |
      | PpcsQueryEmails        | Completed |