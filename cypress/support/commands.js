// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('loginToApplication', () => {

    const userCredentials = {
        "user": {
            "email": "lukasz.pawelec+testapi@netguru.com",
            "password": "password"
        }
    }

    cy.request('POST', 'http://localhost:3000/api/users/login', userCredentials)
    .its('body').then( body => {
        const token = body.user.token
        cy.wrap(token).as('token')
        cy.visit('/', {
            onBeforeLoad (win){
                win.localStorage.setItem('user', '{"username":"everfading","email":"lukasz.pawelec+testapi@netguru.com","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJldmVyZmFkaW5nIiwiZXhwIjoxNjQ0MzIyMzQyLCJpYXQiOjE2MzkxMzgzNDJ9.bgyEexSnOOlB_vs5GdeZj-Wx8x27rx3PMUvYsSqgK0g","bio":null,"image":null,"effectiveImage":"https://static.productionready.io/images/smiley-cyrus.jpg"}')
            }
        
        })
    })

})