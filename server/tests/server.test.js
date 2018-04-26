const expect = require('expect');
const request = require('supertest');

require('./../config/config.js')

const {app} = require('./../server.js');
const {Todo} = require('./../models/Todo.js');
const {User} = require('./../models/User.js');
const {ObjectID} = require('mongodb');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed.js');

let text = 'having dinner';

beforeEach(populateUsers)
beforeEach(populateTodos);

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		request(app)
		.post('/todos')
		.set('x-auth', users[0].tokens[0].token)
		.send({text})
		.expect(200)
		.expect((res) => {
			expect(res.body.text).toEqual(text);

		})
		.end((err, res) => {
			if(err) {
				return done(err);
			}
			Todo.find({text: 'having dinner'}).then((todos) => {
				expect(todos.length).toBe(1);
				expect(todos[0].text).toEqual(text);
				done();
			}).catch((e) => {
				done(e);
			})
		})
	});

	it('should not create a new todo', (done) => {
		request(app)
		.post('/todos')
		.set('x-auth', users[0].tokens[0].token)
		.send()
		.expect(400)
		.expect((res) => {
			expect(res.body.text).toBe(undefined)
		})
		.end((err, res) => {
			if(err) {
				return done(err);
			}
			Todo.find().then((todos) => {
				expect(todos.length).toBe(2);
				done();
			}).catch((e) => {
				done(e);
			})
		})
	})
});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
		.get('/todos')
		.set('x-auth', users[0].tokens[0].token)
		.expect(200)
		.expect((res) => {
			console.log(res.body);
			expect(res.body.todos.length).toBe(1);
		})
		.end(done);
})
});

describe('GET /todos/:id', () => {
	it('should get an todo', (done) => {
		request(app)
		.get(`/todos/${todos[0]._id}`)
		.set('x-auth', users[0].tokens[0].token)
		.expect(200)
		.expect((res) => {
			expect(res.body.text).toEqual(todos[0].text);
		})
		.end(done);
	});

	it('should return a 404 if todo not found', (done) => {
		let id = new ObjectID();
		request(app)
		.get(`/todos/${id}`)
		.set('x-auth', users[0].tokens[0].token)
		.expect(404)
		.end(done);
	})

	it('should return a 404 for non-objectid', (done) => {
		request(app)
		.get(`/todos/123`)
		.set('x-auth', users[0].tokens[0].token)
		.expect(404)
		.end(done);
	})
})

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		request(app)
		.delete(`/todos/${todos[1]._id}`)
		.set('x-auth', users[1].tokens[0].token)
		.expect(200)
		.expect((res) => {
			expect(res.body.todo._id).toEqual(todos[1]._id.toString());
		})
		.end((err, res) => {
			if (err) {
				return done(err);
			}
			Todo.findById(todos[1]._id).then((todo) => {
				expect(todo).toBeFalsy();
				done();
			}).catch((e) => {
				done(e);
			})
		});
	});

	it('should not remove a todo', (done) => {
		request(app)
		.delete(`/todos/${todos[0]._id}`)
		.set('x-auth', users[1].tokens[0].token)
		.expect(404)
		.end((err, res) => {
			if (err) {
				return done(err);
			}
			Todo.findById(todos[0]._id).then((todo) => {
				expect(todo).toBeTruthy();
				done();
			}).catch((e) => {
				done(e);
			})
		});
	});

	it('should return 404 if todo not found', (done) => {
		let id = new ObjectID();
		request(app)
		.delete(`/todos/${id}`)
		.set('x-auth', users[1].tokens[0].token)
		.expect(404)
		.end(done);
	});

	it('shoud return 404 if ObjectID is invalid', (done) => {
		request(app)
		.delete('/todos/23ewdsf')
		.set('x-auth', users[1].tokens[0].token)
		.expect(404)
		.end(done);
	})
})

 describe('PATCH /todos/:id', () => {
 	it('should update the todo', (done) => {
 		let txt = todos[0].text;
 		request(app)
 		.patch(`/todos/${todos[0]._id}`)
 		.set('x-auth', users[0].tokens[0].token)
 		.expect(200)
 		.send({text: "watch a game", completed: true})
 		.expect((res) => {
 			console.log(res.body);
 			expect(res.body.todo.text).not.toEqual(txt);
 			expect(res.body.todo.completed).toBe(true);
 			expect(typeof res.body.todo.completedAt).toBe('number');
 		})
 		.end(done);
 	});

 	it('should clear completedAt when todo is not completed', (done) => {
 		let txt = todos[0].text;
 		request(app)
 		.patch(`/todos/${todos[0]._id}`)
 		.set('x-auth', users[0].tokens[0].token)
 		.expect(200)
 		.send({text: "wash dishes", completed: false})
 		.expect((res) => {
 			console.log(res.body);
 			expect(res.body.todo.text).not.toEqual(txt);
 			expect(res.body.todo.completed).toBe(false);
 			expect(res.body.todo.completedAt).toBeFalsy();
 		})
 		.end(done);
 	})
 })

 describe('GET /users/me', () => {
 	it('should return user if authenticated', (done) => {
 		request(app)
 		.get('/users/me')
 		.set('x-auth',users[0].tokens[0].token)
 		.expect(200)
 		.expect((res) => {
 			expect(res.body.email).toEqual('userOne@gmail.com')
 		})
 		.end(done);
 	});

 	it('should should return 401 if not authenticated', (done) => {
 		request(app)
 		.get('/users/me')
 		.expect(401)
  		.expect((res) => {
  			expect(res.body).toEqual({})
  		})
 		.end(done);
 	});
 })

 describe('POST /users', () => {
 	it('should create a user', (done) => {
 		let email = 'binwei1988@gmail.com';
 		let password = '123edsff';
 		request(app)
 		.post('/users')
 		.send({email, password})
 		.expect(200)
 		.expect((res) => {
 			expect(res.headers['x-auth']).toBeTruthy();
 			expect(res.body.email).toEqual(email);
 		})
 		.end(done);
 	});

 	it('should return validation error if request invalid', (done) => {
 		let email = "faaafa";
 		let password = 'afda';
 		request(app)
 		.post('/users')
 		.send({email, password})
 		.expect(400)
 		.expect((res) => {
 			expect(res.headers['x-auth']).toBeFalsy();
 			expect(res.body.email).not.toEqual(email);
 		})
 		.end(done);
 	})

 	it('should not create user if email in use', (done) => {
 		let email = users[0].email;
 		let password = users[0].password;
 		request(app)
 		.post('/users')
 		.send({email, password})
 		.expect(400)
 		.expect((res) => {
 			expect(res.headers['x-auth']).toBeFalsy();
 			expect(res.body.email).not.toEqual(email);
 		})
 		.end(done);
 	})
 });

 describe('POST /users/login', () => {
 	it('should longin user and return auth token', (done) => {
 		request(app)
 		.post('/users/login')
 		.send({email: users[1].email, password: users[1].password})
 		.expect(200)
 		.expect((res) => {
 			expect(res.headers['x-auth'].toExist)
 		})
 		.end((err, res) => {
 			if (err) {
 				return done(err);
 			}
 			User.findById(users[1]._id).then((user) => {
 				expect(user.tokens[1].toObject()).toMatchObject({
 					access: 'auth',
 					token: res.headers['x-auth']
 				});
 				done();
 			}).catch((e) => done(e));
 		})
 	});

 	it('should reject invalid login', (done) => {
 		request(app)
 		.post('/users/login')
 		.send({email: users[1].email, password: "78hujoik"})
 		.expect(400)
 		.expect((res) => {
 			expect(res.headers['x-auth']).toNotExist
 		})
 		.end((err, res) => {
 			if (err) {
 				return done(err);
 			}
 			User.findById(users[1]._id).then((user) => {
 				expect(user.tokens.length).toBe(1);
 				done();
 			}).catch((e) => done(e));
 		})
 	});


 })




