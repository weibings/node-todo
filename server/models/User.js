const {mongoose} = require('./../db/mongoose.js');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

let UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: validator.isEmail,
		message: '{VALUE} is not a valid email'
	},
	password: {
		type: String,
		required:true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
})

UserSchema.methods.toJSON = function() {
	let user = this;
	return _.pick(user.toObject(), ['email', '_id']);
}
UserSchema.methods.generateAuthToken = function() {

	let user = this;
	let access = 'auth';
	let token = jwt.sign({_id: user._id, access}, 'miawei').toString();
	user.tokens.push({access, token});
	console.log(user);
	return user.save().then(() => {
		return token;
	});
};

let User = mongoose.model('User', UserSchema);

module.exports = {User};

