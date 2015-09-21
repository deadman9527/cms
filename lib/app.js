var express = require('express'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	morgan = require('morgan'),
	methodOverride = require('method-override'),
	errorHandler = require('errorhandler'),
	pathModule = require('path'),
	Utils = require('./tools/utils'),
	routes = require('./routes/index'),
	formidable = require('formidable'),
	compression = require('compression');

var config = Utils.getJSONSync("config.json"),
	app = express();

app.set('port', process.env.PORT || config.port);
app.set('views', pathModule.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');

// 中间件
app.use(compression())
//app.use(favicon(pathModule.join(__dirname, '..', 'public', 'favicon.ico')));
app.use(morgan('dev'));
//app.use(bodyParser({'limit': 512000}));
app.use(bodyParser.urlencoded({'extended': false, 'limit': 512000}));
app.use(bodyParser.json({'limit': 512000}));
app.use(methodOverride());

app.use(cookieParser());
app.use(session({
	secret: '6b1b36cbb04b41490bfc0ab2bfa26f86',
	resave: true,
	saveUninitialized: true
})); 
app.use(express.query());

app.use(express.static(pathModule.join(__dirname, '..', 'public')));

// 文件上传
app.use(function(req, res, next){
	if(req.is('multipart/form-data')){		
		var formObj = new formidable.IncomingForm({
			uploadDir: pathModule.join(config.buildPath, 'img'),
			keepExtensions: true,
			multiples: true
		});
    	formObj.parse(req, function(err, fields, files) {
    		if(!err){
				req.files = files;
				req.fileFields = fields;
    		}
     		next && next();
    	});
	}else{
		next && next();
	}
});


app.use(errorHandler());
// development only
if (app.get('env') === 'development') {
	app.set('port', config.dev.port);
}

routes.bind(app);


// 启动服务
app.listen(app.get('port'), function(){
	console.log('Express CMS Service run at ' + app.get('env') + ' listening on port ' + app.get('port'));
});

