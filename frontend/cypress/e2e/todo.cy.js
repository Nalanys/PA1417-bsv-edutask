describe('Todo tests', () => {
    // define variables that we need on multiple occasions
    let uid // user id
    let name // name of the user (firstName + ' ' + lastName)
    let email // email of the user
    let testNumber // what number the test is to find the correct task
    let tasks // tasks that are in the database
  
    before(function () {
      testNumber = 0
      cy.request('POST', 'http://localhost:5000/populate').then((response) => {
        uid = response.body.users[0];

        // Now make the second request using uid
        cy.request('GET', `http://localhost:5000/users/${uid}`).then((response) => {
          email = response.body.email;
          name = response.body.firstName + " " + response.body.lastName;

          // You can log or use email and name here
          cy.log(`User: ${name}, Email: ${email}`);
        });
        cy.request('GET', `http://localhost:5000/tasks/ofuser/${uid}`).then((response) => {
          tasks = response.body
          console.log(response.body)
        });
      });

    });
      
  
    beforeEach(function () {
      // // enter the main main page
      // cy.visit('http://localhost:3000')
      // cy.contains('div', 'Email Address')
      //   .find('input[type=text]')
      //   .type(email)
  
      // // submit the form on this page
      // cy.get('form')
      //   .submit()

      // // Doing last item when testing so it actually test the newest added item
      // cy.get('div.title-overlay')
      //   .filter(':contains("Testing Task")')
      //   .last()
      //   .closest('.container-element')
      //   .click();

      // cy.get('.popup')
      //   .should('be.visible')
      cy.visit('http://localhost:3000')
      cy.contains('div', 'Email Address')
        .find('input[type=text]')
        .type(email)

      cy.get('form')
        .submit()
    })

    it('if description empty do not add', () => {
      cy.contains('div.title-overlay', `${tasks[0].title}`).click({ force: true });
        
      cy.get('.popup form.inline-form input[type="text"]')
        .clear()
        .should('have.value', '');

      // Ensure the submit button is disabled
      cy.get('.popup form.inline-form input[type="submit"]')
        .should('be.disabled');
    })

   it('adding item to todo list', () => {
      const task = tasks[0];
      console.log(task);

      const newTodo = { taskid: task._id.$oid, description: 'HELLO', done: 'false' };
      console.log(newTodo);

      cy.request({
        method: 'POST',
        url: `http://localhost:5000/todos/create`,
        form: true,
        body: newTodo
      }).then((postResponse) => {
        expect(postResponse.status).to.eq(200);
        const createdTodo = postResponse.body;

        expect(createdTodo.description).to.eq(newTodo.description);
        expect(String(createdTodo.done)).to.eq(newTodo.done);
      });
    });

    // it('setting todo item to done', () => {

    //   cy.contains('li.todo-item', 'Test Adding Task')
    //     .find('span.checker')
    //     .should('have.class', 'unchecked')

    //   cy.contains('li.todo-item', 'Test Adding Task')
    //     .find('span.checker')
    //     .click()

    //   cy.contains('li.todo-item', 'Test Adding Task')
    //     .find('span.checker')
    //     .should('have.class', 'checked')
    // })

    // it('setting todo item to active', () => {

    //   cy.contains('li.todo-item', 'Test Adding Task')
    //     .find('span.checker')
    //     .should('have.class', 'checked')

    //   cy.contains('li.todo-item', 'Test Adding Task')
    //     .find('span.checker')
    //     .click()

    //   cy.contains('li.todo-item', 'Test Adding Task')
    //     .find('span.checker')
    //     .should('have.class', 'unchecked')
    // })

    // it('delete todo item', () => {
    //   cy.contains('li.todo-item', 'Test Adding Task')
    //     .find('span.remover')
    //     .click()

    //   cy.get('ul.todo-list')
    //     .should('not.contain', 'Test Adding Task')
    // })

})