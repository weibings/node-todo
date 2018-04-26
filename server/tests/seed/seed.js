const {Todo} = require('./../../models/Todo.js');
const {User} = require('./../../models/User.js');
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');


let userOne = new ObjectID();
let userTwo = new ObjectID();

let todos = [{
	_id: new ObjectID(), 
	text: 'first thing to do',
	_creator: userOne
	}, {
	_id: new ObjectID(), 
	text: 'second thing to do', 
	completed: true, 
	completedAt: 323,
	_creator: userTwo}];

let populateTodos = (done) => {
	Todo.remove({}).then(()=> {
		Todo.insertMany(todos);
		done();
})
};


let users = [{
	_id: userOne,
	email: 'userOne@gmail.com',
	password: "userOne",
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOne, access: 'auth'}, process.env.JWT_SECRET).toString()
	}]
}, {
	_id: userTwo,
	email: 'userTwo@gmail.com',
	password: "userTwo",
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userTwo, access: 'auth'}, process.env.JWT_SECRET).toString()
	}]
}];

let populateUsers = (done) => {

	User.remove({}).then(() => {
		let user1 = new User(users[0]).save();

		let user2 = new User(users[1]).save();
		return Promise.all([user1, user2])
	}).then(() => 
		done());
}

module.exports = {todos, populateTodos, users, populateUsers}