const {mongoose} = require('./../db/mongoose.js');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
	let token = jwt.sign({_id: user._id, access}, process.env.JWT_SECRET).toString();
	user.tokens.push({access, token});
	return user.save().then(() => {
		return token;
	});
};

UserSchema.methods.removeToken = function(token) {
	let user = this;

	return user.update({$pull : {tokens: {token}}});
}

UserSchema.statics.findByToken = function(token) {
	let User = this;
	let decoded;

	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	}catch(e){
		return Promise.reject();
	}
	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	})
}

UserSchema.statics.findByCredential = function(email, password) {
	let User = this;
	return User.findOne({email}).then((user) => {
		if (!user) {
			return Promise.reject();
		}
		return bcrypt.compare(password, user.password).then((result) => {
			if (result) {
				return Promise.resolve(user);
			}else{
				return Promise.reject();
			}
		});
	// 	return new Promise((resolve, reject) => {
	// 		bcrypt.compare(password, user.password, (err, res) => {
	// 		if(res) {
	// 			resolve(user);
	// 		}else{
	// 			reject();
	// 		}
	// 	})
	// });
})
		
}

UserSchema.pre('save', function(next){
	const user = this;
	if(user.isModified('password')){
		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(user.password, salt, function(err, hash){
				user.password = hash;
				next();
			})
		});
	}else{
		next();
	}
})
let User = mongoose.model('User', UserSchema);

module.exports = {User};

