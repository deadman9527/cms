var pathModule = require("path"),
	S = require("kissy").KISSY,
	UtilTools = require('../tools/utils'),
	modBase = require('./base'),
	pageDB = require('../db/page');

var dataTemp = function(req, res){
	var modId = req.params['id'];
	
	modBase.getData(modId, function(data){
		res.render('includes/datatemp', {
			data: data
		});		
	});
	
};

module.exports.render = dataTemp;
