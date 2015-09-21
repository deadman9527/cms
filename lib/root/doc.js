// 文档
var S = require("kissy").KISSY,
	pathModule = require("path"),
	readMd = require('../tools/read-md'),
	fs = require("fs"),
	UtilTools = require('../tools/utils');

var docPath = 'doc'

var docPage = function(req, res){
	var file = req.params['file'],
		filePath = pathModule.join(docPath, file + '.md'),
		content;
	
	if(fs.existsSync(filePath)){
		content = readMd.read(filePath);
		res.render('doc', {
			header: req.systemHeaderInfo,
			content: content
		});
	}else{
		res.send('页面不存在！');
	}

}

module.exports.render = docPage;
