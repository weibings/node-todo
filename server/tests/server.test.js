const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server.js');
const {Todo} = require('./../models/Todo.js');

let text = 'having dinner';

beforeEach((done) => {
	Todo.remove({}).then(()=> done());
})
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
			Todo.find().then((todos) => {
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
				expect(todos.length).toBe(0);
				done();
			}).catch((e) => {
				done(e);
			})
		})
	})
})