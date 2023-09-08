Feature: Contact Information section on the Task List

  Contact Information is present on Part A Task List

  @MRD-1723 @MRD-1731
  Scenario: Contact information section is present when PO tries to complete Part A task list
    Given a PO has created a recommendation to recall with:
      | Indeterminate | No |
      | Extended      | No |
    And PO has started creating the Part A form without requesting SPO review
    When PO has updated Who completed this Part A question under Contact Information section
    And PO has updated "Where should the revocation order be sent?" under Contact Information section
    And PO has updated "Where should the PPCS respond with?" under Contact Information section
    Then the PO task-list has the following status:
      | whoCompletedPartA      | Completed |
      | practitionerForPartA   | Completed |
      | revocationContact      | Completed |
      | correspondenceEmail    | Completed |