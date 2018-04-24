const {mongoose} = require('./db/mongoose.js');
const {User} = require('./models/User.js');
const {Todo} = require('./models/Todo.js');

const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');


let app = express();

// let newTodo = new Todo ({
// 	text: 'coding',
// 	completed: false
// })

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

app.listen(3000, () => {
	console.log('Start port 3000');
})


module.exports = {app};
