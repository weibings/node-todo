require('./config/config.js');

const {mongoose} = require('./db/mongoose.js');
const {User} = require('./models/User.js');
const {Todo} = require('./models/Todo.js');

const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const authenticate = require('./middleware/authenticate.js');
const bcrypt = require('bcryptjs');

const port = process.env.PORT;
let app = express();

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {

	let newTodo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});
	newTodo.save().then((doc) => {
		res.send(doc);
	}).catch((e) =>{
		res.status(400).send(e);
	});
})

app.get('/todos', authenticate, (req, res) => {
	Todo.find({_creator: req.user._id}).then((todos) => {
		if(todos) {
			return res.send({todos});
		}else{
			res.send('No todos found');
		}
	}).catch((e) => {
		res.send(e);
	})
})

app.get('/todos/:id', authenticate, (req, res) => {
	let id = req.params.id;
	if(!ObjectID.isValid(id)){
		return res.status(404).send();
	}
	Todo.findOne({_id: id, _creator: req.user._id}).then((todo) => {
		if(!todo){
			return res.status(404).send('Not found');
		}
		res.send(todo);
	}).catch((e) => {
		res.status(404).send(e);
	})
})

app.delete('/todos/:id', authenticate, (req, res) => {
	let id = req.params.id;
	if(!ObjectID.isValid(id)){
		return res.status(404).send();
	}
	Todo.findOneAndRemove({_id: id, _creator: req.user._id}).then((todo) => {
		if(!todo){
			return res.status(404).send('Not found');
		}
		res.send({todo});
	}).catch((e) => {
		res.status(404).send(e);
	})
})

app.patch('/todos/:id', (req, res) => {
	let id = req.params.id;
	let body = _.pick(req.body, ['text', 'completed']);

	if(!ObjectID.isValid(id)){
		return res.status(404).send();
	}
	if(_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	}else{
		body.completed = false;
		body.completedAt = null;
	}
	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
		if(!todo) {
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		res.status(400).send(e)
	})
});

app.post('/users', (req, res) => {
	let body = _.pick(req.body, ['email', 'password']);
	let user = new User(body);
	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	})
})

app.post('/users/login', (req, res) => {
	let body = _.pick(req.body, ['email', 'password']);
	User.findByCredential(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		})
	}).catch((e) => {
		res.status(400).send();
	})
})
app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
})

app.delete('/users/me/token', (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	})
})
app.listen(port, () => {
	console.log(`Start port ${port}`);
})


module.exports = {app};
