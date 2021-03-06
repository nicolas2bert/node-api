/*const data = require('../../data.json')

module.exports = data.users;*/

const uuid = require('uuid');
const levelPath = require('../level');
/*const level = require('level');
const levelPath = level('tmp/sublevel-exemple');*/
const sublevel = require('level-sublevel/legacy');
const db = sublevel(levelPath);
const users = db.sublevel('users');

const options = [{
	valueEncoding : 'json'
}];

function User(data){
	this._id = data._id || null;
	this.name = data.name || null;
	return this
}

User.prototype = {
	get: function(val){
		return this[val]; 
	},
	set: function(val,data){
		this[val] = data;
	}
}

exports.create = function(req,res){
	const user = req.body;
	const id = uuid.v1();
	const u = new User(user);
	u.set('_id',id)
	const uJSON = JSON.stringify(u);
	users.put(id, uJSON, options, function(err){
		if (err) {
			console.log(err);
			return res.json(500, {'error': {'message': 'ERROR PUT'}});
		}
		res.json({'success': 'User successfully created!', 'data': u});
	});
}

exports.update = function(req,res){
	const id = req.params.id;
	const user = req.body;
	users.get(id, options, function(err,valueJSON){
		if (err) {
			console.log(err);
			return res.json(500, {'error': {'message': 'ERROR PUT'}});
		}
		const valueOBJ = JSON.parse(valueJSON);
		const u = new User(valueOBJ);

		// only accept name update
		for (const prop in user) {
			if (u.hasOwnProperty(prop)) {
				u.set(prop,user[prop]);
			}
		}
		// cannot update _id
		u.set('_id',id);
		const uJSON = JSON.stringify(u);
		users.put(id, uJSON, options, function(err){
			if (err) {
				console.log(err);
				return res.json(500, {'error': {'message': 'ERROR PUT'}});
			}
			res.json({'success':'User Updated!','data':u});
		});
	})
}

exports.getById = function(req,res){
	const id = req.params.id;
	users.get(id, options, function(err, valueJSON){
		if (err){
			console.log(err);
			return res.json(500,{'error' : {'message':'ERROR GET'}});
		}
		const valueOBJ = JSON.parse(valueJSON);
		res.json({'success':'User Found','data':valueOBJ});
	});
}

exports.getAll = function (req, res) {
	const allJSON = [];
	users.createReadStream()
	  .on('data', function (dataJSON) {
	  	console.log(dataJSON);
	  	//const dataOBJ = JSON.parse(dataJSON);
	  	//console.log(dataOBJ);
	    allJSON.push(dataJSON);
	  })
	  .on('error', function (err) {
	  	console.log(err);
	  })
	  .on('end', function () {
	  	//const allOBJ = JSON.parse(allJSON);
	    res.json(allJSON);
	    console.log(allJSON);
	  });
};

exports.del = function(req, res) {
	const id = req.params.id;
	users.del(id, function(err){
		if (err){
			console.log(err);
			return res.json(400,{'error' : {'message':'ERROR DELETE'}});
		}
		res.json({'success':'User deleted'});
	})
}