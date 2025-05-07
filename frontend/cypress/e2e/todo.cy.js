describe('Todo tests', () => {
    // define variables that we need on multiple occasions
    let uid // user id
    let name // name of the user (firstName + ' ' + lastName)
    let email // email of the user
  
    before(function () {
      // create a fabricated user from a fixture
      cy.fixture('user.json')
        .then((user) => {
          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/users/create',
            form: true,
            body: user
          }).then((response) => {
            uid = response.body._id.$oid
            name = user.firstName + ' ' + user.lastName
            email = user.email
          })
        })
    })

    before(function () {
      cy.visit('http://localhost:3000')
      cy.contains('div', 'Email Address')
        .find('input[type=text]')
        .type(email)

      cy.get('form')
        .submit()
    
      cy.contains('div', "Title")
        .find('input[type=text]')
        .type("Testing Task")

      cy.contains('div', 'YouTube URL')
        .find('input[type=text]')
        .type('https://youtu.be/pRh-21VLreI?si=6LfDa0RUCes2xz4U')

      cy.get('form')
        .submit()

    })
  
    beforeEach(function () {
      // enter the main main page
      cy.visit('http://localhost:3000')
      cy.contains('div', 'Email Address')
        .find('input[type=text]')
        .type(email)
  
      // submit the form on this page
      cy.get('form')
        .submit()

      // Doing last item when testing so it actually test the newest added item
      cy.get('div.title-overlay')
        .filter(':contains("Testing Task")')
        .last()
        .closest('.container-element')
        .click();

      cy.get('.popup')
        .should('be.visible')
    })

    it('if description empty do not add', () => {
      cy.get('.popup form.inline-form input[type="text"]')
        .clear()
        .should('have.value', '');

      // Ensure the submit button is disabled
      cy.get('.popup form.inline-form input[type="submit"]')
        .should('be.disabled');
    })


    it('adding item to todo list', () => {

      cy.get('.popup')
        .find('form.inline-form input[type="text"]')
        .type('Test Adding Task');

      cy.get('.popup')
        .find('form.inline-form')
        .submit();

      cy.get('li.todo-item')
        .should('contain.text', 'Test Adding Task')
    })

    

    it('setting todo item to done', () => {

      cy.contains('li.todo-item', 'Test Adding Task')
        .find('span.checker')
        .should('have.class', 'unchecked')

      cy.contains('li.todo-item', 'Test Adding Task')
        .find('span.checker')
        .click()

      cy.contains('li.todo-item', 'Test Adding Task')
        .find('span.checker')
        .should('have.class', 'checked')
    })

    it('setting todo item to active', () => {

      cy.contains('li.todo-item', 'Test Adding Task')
        .find('span.checker')
        .should('have.class', 'checked')

      cy.contains('li.todo-item', 'Test Adding Task')
        .find('span.checker')
        .click()

      cy.contains('li.todo-item', 'Test Adding Task')
        .find('span.checker')
        .should('have.class', 'unchecked')
    })

    it('delete todo item', () => {
      cy.contains('li.todo-item', 'Test Adding Task')
        .find('span.remover')
        .click()

      cy.get('ul.todo-list')
        .should('not.contain', 'Test Adding Task')
    })

})