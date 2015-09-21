/**
 * 运用markdown 渲染说明文件
 */

var fs = require("fs"),
	marked = require("marked");

marked.setOptions({
	breaks: true
});

var readMd = function(path){
	var output = '';
	if(fs.existsSync(path)){
		output = marked(fs.readFileSync(path, "utf8"));
	}
	return output;
};

module.exports.read = readMd;
