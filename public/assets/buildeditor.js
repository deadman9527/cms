var tmsRichEditor = null;
KISSY.use("editor", function (S, Editor) {
	var cfg ={
		render:'#J_EditorCon',
		focused: false,
		attachForm: false,
		baseZIndex: 1000
	};

	var plugins = ["source-area",
		"separator",
		"bold",
		"italic",
		"strike-through",
		"underline",
		"separator",
		"image",
		"link",
		"fore-color",
		"back-color",
		"resize",
		"undo",
		"indent",
		"outdent",
		"unordered-list",
		"ordered-list",
		"element-path",
		"page-break",
		"remove-format",
		"heading",
		"justify-left",
		"justify-center",
		"justify-right",
		"table",
		"smiley"];

	var fullPlugins = [];

	S.each(plugins, function (p, i) {
		fullPlugins[i] = "editor/plugin/" + p;
	});

	var pluginConfig = {
		"link": {
			target: "_blank"
		},
		"image": {
			defaultMargin: 0,
			remote:false,
		}
	};

	KISSY.use(fullPlugins, function (S) {
		var args = S.makeArray(arguments);
		args.shift();
		S.each(args, function (arg, i) {
			var argStr = plugins[i], cfg;
			if (cfg = pluginConfig[argStr]) {
				args[i] = new arg(cfg);
			}
		});
		cfg.plugins = args;
		
		tmsRichEditor = new Editor(cfg).render();
				
	});

});

