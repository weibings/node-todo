
const {mongoose} = require('./db/mongoose.js');
const {User} = require('./models/User.js');
const {Todo} = require('./models/Todo.js');

const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const port = process.env.PORT || 3000;
let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {

	let body = req.body;
	let newTodo = new Todo(body);
	newTodo.save().then((doc) => {
		res.send(body);
	}).catch((e) =>{
		res.status(400).send(e);
	});
})

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		if(todos) {
			return res.send({todos});
		}else{
			res.send('No todos found');
		}
	}).catch((e) => {
		res.send(e);
	})
})

app.get('/todos/:id', (req, res) => {
	let id = req.params.id;
	if(!ObjectID.isValid(id)){
		return res.status(404).send();
	}
	Todo.findById(id).then((todo) => {
		if(!todo){
			return res.status(404).send('Not found');
		}
		res.send(todo);
	}).catch((e) => {
		res.status(404).send(e);
	})
})

app.delete('/todos/:id', (req, res) => {
	let id = req.params.id;
	if(!ObjectID.isValid(id)){
		return res.status(404).send();
	}
	Todo.findByIdAndRemove(id).then((todo) => {
		if(!todo){
			return res.status(404).send('Not found');
		}
		res.send(todo);
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

app.listen(port, () => {
	console.log(`Start port ${port}`);
})


module.exports = {app};
