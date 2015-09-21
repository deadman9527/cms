/**
 * 运用markdown 渲染说明文件
 */

var Utils = require("./utils");

// git pull
var pull = function(basePath, callback){
	var command = 'lib/bin/gitpull.sh ' + basePath;
	Utils.exec(command, callback);
};


module.exports.pull = pull;
