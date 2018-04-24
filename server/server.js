const {mongoose} = require('./db/mongoose.js');
const {User} = require('./models/User.js');
const {Todo} = require('./models/Todo.js');

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

app.listen(3000, () => {
	console.log('Start port 3000');
})


module.exports = {app};
