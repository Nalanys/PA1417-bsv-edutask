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
        console.log(response);
        cy.request('GET', "http://localhost:5000/users/bymail/jane.doe@gmail.com").then((response) => {
          email = response.body.email;
          name = response.body.firstName + " " + response.body.lastName;
          uid = response.body._id.$oid; 
          cy.log(`User: ${name}, Email: ${email}, id:${uid}`);
          cy.request('GET', `http://localhost:5000/tasks/ofuser/${uid}`).then((response) => {
            tasks = response.body
            console.log(response.body)
          });
        });
        
      });
    });
      
  
    beforeEach(function () {
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
      let newTodoId;
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
        newTodoId = postResponse.body._id.$oid;
        console.log("Inne nytt id", newTodoId);

        cy.contains('div.title-overlay', `${tasks[0].title}`).click({ force: true });

        cy.get('li.todo-item')
          .should('contain.text', `${newTodo.description}`)

        
        if(newTodoId) {
          console.log("HEEEEJ");
          cy.request({
            method: 'DELETE',
            url: `http://localhost:5000/todos/byid/${newTodoId}`
          }).then((response) => {});
        }
        expect(createdTodo.description).to.eq(newTodo.description);
        expect(String(createdTodo.done)).to.eq(newTodo.done);
      });
        
    });

    it('setting todo item to done', () => {
      const todoId = tasks[0].todos[0]._id.$oid;
      console.log("NEEEEW ID", todoId);
      const updateData = {
        $set: {
          done: true
        }
      };
      cy.request({
        method: 'PUT',
        url: `http://localhost:5000/todos/byid/${todoId}`,
        form: true,
        body: {
          data: JSON.stringify(updateData)
        }
      }).then((response) => {
        cy.contains('div.title-overlay', `${tasks[0].title}`).click({ force: true });

        cy.contains('li.todo-item', `${tasks[0].todos[0].description}`)
          .find('span.checker')
          .should('have.class', 'checked')
      });
      
    });

    it('setting todo item to active', () => {
      const todoId = tasks[0].todos[1]._id.$oid;
      console.log("NEEEEW ID", todoId);
      const updateData = {
        $set: {
          done: true
        }
      };
      cy.request({
        method: 'PUT',
        url: `http://localhost:5000/todos/byid/${todoId}`,
        form: true,
        body: {
          data: JSON.stringify(updateData)
        }
      }).then((response) => {

        const updateData2 = {
          $set: {
            done: false
          }
        };
        cy.request({
          method: 'PUT',
          url: `http://localhost:5000/todos/byid/${todoId}`,
          form: true,
          body: {
            data: JSON.stringify(updateData2)
          }
        }).then((response) => {
          
          cy.contains('div.title-overlay', `${tasks[0].title}`).click({ force: true });

          cy.contains('li.todo-item', `${tasks[0].todos[1].description}`)
            .find('span.checker')
            .should('have.class', 'unchecked')
        });
      });
    })

    it('delete todo item', () => {
      const task = tasks[0];
      console.log(task);
      let newTodoId;
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
        newTodoId = postResponse.body._id.$oid;
        console.log("Inne nytt id", newTodoId);

        
        if(newTodoId) {
          console.log("HEEEEJ");
          cy.request({
            method: 'DELETE',
            url: `http://localhost:5000/todos/byid/${newTodoId}`
          }).then((response) => {});
        }
      });
      cy.contains('div.title-overlay', `${tasks[0].title}`).click({ force: true });

      cy.get('ul.todo-list')
        .should('not.contain', `${newTodo.description}`)
    })

})
