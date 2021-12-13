/// <reference types="cypress" />

describe('Test with backend', () => {

    beforeEach('login to the app', () => { 
        cy.intercept({method: 'Get', path: 'tags'}, {fixture:'tags.json'})
        cy.loginToApplication()
    })

    it('verify correct request and response', () =>{
        cy.intercept('POST', '**/articles').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[placeholder="Article Title"]').type('This is a title')
        cy.get('[placeholder="Description"]').type('This is a description')
        cy.get('[placeholder="Write your article (in markdown)"]').type('This is a body of the article')
        cy.contains("Publish Article").click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr =>{
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equal('This is a description')
        })
    })

    it('intercepting and modifying the request and response', () =>{
        // cy.intercept('POST', '**/articles', (req) => {
        //     req.body.article.description = "This is a description 2"
        // }).as('postArticles')

        cy.intercept('POST', '**/articles', (req) => {
            req.reply( res => {
                expect(res.body.article.description).to.equal('This is a description')
                res.body.article.description = "This is a description 2"
            })
        }).as('postArticles')

        cy.contains('New Article').click()
        cy.get('[placeholder="Article Title"]').type('This is a title')
        cy.get('[placeholder="Description"]').type('This is a description')
        cy.get('[placeholder="Write your article (in markdown)"]').type('This is a body of the article')
        cy.contains("Publish Article").click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr =>{
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equal('This is a description 2')
        })
    })

    it('should check tags with routing object', () => {

        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')

    })

    it('verify global feed likes count', () => {

        cy.intercept('GET', '**/articles/feed*', {"articles":[],"articlesCount":0})
        cy.intercept('GET', '**/articles*', {fixture: 'articles.json'})
        cy.wait(2000)
        cy.contains('Global Feed').click()
        cy.get('[class="btn btn-sm btn-outline-primary"]').then( listOfbuttons => {

            expect(listOfbuttons[0]).to.contain('102')
            expect(listOfbuttons[1]).to.contain('10')

        })

        cy.fixture('articles').then( file => {

            const articleLink = file.articles[1].slug
            cy.intercept('POST', '**/articles'+articleLink+'/favorite', file)
        })

        cy.get('[class="btn btn-sm btn-outline-primary"]')
        .eq(1)
        .click()
        .should('contain', '11')

    })

    it('delete a new article in a global feed', () => {

        const bodyRequest = {
            "article": {
                "description": "API testing is easy",
                "body": "Angular is cool",
                "tagList": [],
                "title": "Request from API"
            }
        }

            cy.get('@token').then(token => {

            cy.request({
                url: 'http://localhost:3000/api/articles',
                headers: { 'Authorization': 'Token '+token},
                method: 'POST',
                body: bodyRequest
            })
                .then( response => {
                expect(response.status).to.equal(200)

            })

            cy.contains('Global Feed').click()
            cy.get('.article-preview').first().click()
            cy.wait(1000)
            cy.get('[class="article-meta"]').contains(' Delete Article').click()
            cy.wait(5000)


            cy.request({
                url: 'http://localhost:3000/api/articles?limit=10&offset=0',
                headers: { 'Authorization': 'Token '+token},
                method: 'GET'
            }).its('body').then(body => {
                expect(body.articles[0].title).not.to.equal('Request from API')

            })
        })

    })
})
