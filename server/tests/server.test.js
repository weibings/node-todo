const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server.js');
const {Todo} = require('./../models/Todo.js');
const {ObjectID} = require('mongodb');

let text = 'having dinner';

let todos = [{_id: new ObjectID(), text: 'first thing to do'}, {_id: new ObjectID(), text: 'second thing to do', completed: true, completedAt: 323}];

beforeEach((done) => {
	Todo.remove({}).then(()=> {
		Todo.insertMany(todos);
		done();
})
});

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		request(app)
		.post('/todos')
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
		.expect(200)
		.expect((res) => {
			console.log(res.body);
			expect(res.body.todos.length).toBe(2);
		})
		.end(done);
})
});

describe('GET /todos/:id', () => {
	it('should get an todo', (done) => {
		request(app)
		.get(`/todos/${todos[0]._id.toHexString()}`)
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
		.expect(404)
		.end(done);
	})

	it('should return a 404 for non-objectid', (done) => {
		request(app)
		.get(`/todos/123`)
		.expect(404)
		.end(done);
	})
})

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		request(app)
		.delete(`/todos/${todos[0]._id}`)
		.expect(200)
		.expect((res) => {
			expect(res.body._id).toEqual(todos[0]._id);
		})
		.end((err, res) => {
			if (err) {
				return done(err);
			}
			Todo.findById(todos[0]._id).then((todo) => {
				expect(todo).toNotExist();
				done();
			}).catch((e) => {
				done(e);
			})
		});
	});

	it('should return 404 if todo not found', (done) => {
		let id = new ObjectID();
		request(app)
		.delete('/todos/id')
		.expect(404)
		.end(done);
	});

	it('shoud return 404 if ObjectID is invalid', (done) => {
		request(app)
		.delete('/todos/23ewdsf')
		.expect(404)
		.end(done);
	})
})

 describe('PATCH /todos/:id', () => {
 	it('should update the todo', (done) => {
 		let txt = todos[0].text;
 		request(app)
 		.patch(`/todos/${todos[0]._id}`)
 		.expect(200)
 		.send({text: "watch a game", completed: true})
 		.expect((res) => {
 			console.log(res.body);
 			expect(res.body.todo.text).toNotEqual(txt);
 			expect(res.body.todo.completed).toBe(true);
 			expect(res.body.todo.completedAt).toBeA('number');
 		})
 		.end(done);
 	});

 	it('should clear completedAt when todo is not completed', (done) => {
 		let txt = todos[0].text;
 		request(app)
 		.patch(`/todos/${todos[0]._id}`)
 		.expect(200)
 		.send({text: "wash dishes", completed: false})
 		.expect((res) => {
 			console.log(res.body);
 			expect(res.body.todo.text).toNotEqual(txt);
 			expect(res.body.todo.completed).toBe(false);
 			expect(res.body.todo.completedAt).toNotExist();
 		})
 		.end(done);
 	})
 })




