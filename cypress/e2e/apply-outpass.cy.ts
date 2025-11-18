/// <reference types="cypress" />

describe("Apply Outpass flow", () => {
  it("opens modal and validates button text", () => {
    cy.visit("/student/dashboard");
    cy.contains("Apply Outpass").click();
    cy.get("textarea").type("Need to visit home for function");
    cy.contains("Submit Request").should("be.visible");
  });
});

