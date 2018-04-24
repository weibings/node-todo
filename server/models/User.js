const {mongoose} = require('./../db/mongoose.js');

let User = mongoose.model('User', {
	email: {
		type: String,
		required: true,
		minlength: 6
	},
	password: {
		type: String,
		required:true,
		minlength: 6
	}
});

module.exports = {User};

