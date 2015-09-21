// Page index
var indexPage = function(req, res){
	res.render('index', {
		header: req.systemHeaderInfo
	});
};

module.exports.render = indexPage;
