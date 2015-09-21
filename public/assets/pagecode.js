/**
 * @desc    Mod 模块
 * @date    2014-08-10
 */
;(function($){

    var htmlPanel,cssPanel,jsPanel,confPanel;
    var Mod = {},
    	S = KISSY;
	
	var initConfig = {
		indentUnit: 4,
		tabSize: 4,
		theme: 'ambiance',
		lineNumbers: true,
		styleActiveLine: true,
		matchBrackets: true
	};

    $.extend(Mod, {

        init: function(){
            var _self = this;

            _self.edit();
            _self.preview();

        },

        edit: function(){
            var _self = this;
            
			_self.confPanel = CodeMirror.fromTextArea($('#J_ConfigCode')[0], S.merge(initConfig, {
				mode: 'text/javascript'
			}));
			_self.htmlPanel = CodeMirror.fromTextArea($('#J_HtmlCode')[0], S.merge(initConfig, {
				mode: 'text/html'
			}));
			
        	if($('#J_CssCode')[0]){
				_self.cssPanel = CodeMirror.fromTextArea($('#J_CssCode')[0], S.merge(initConfig, {
					mode: 'text/css'
				}));
        	}
        	if($('#J_JsCode')[0]){
				_self.jsPanel = CodeMirror.fromTextArea($('#J_JsCode')[0], S.merge(initConfig, {
					mode: 'text/javascript'
				}));
        	}
        	if($('#J_DataCode')[0]){
				_self.dataPanel = CodeMirror.fromTextArea($('#J_DataCode')[0], S.merge(initConfig, {
					mode: 'text/javascript'
				}));
        	}

        },

        preview: function(){
            var _self = this;
            
            $('a[data-toggle="tab"]').on('shown.bs.tab', function(){
            	var codePanel = _self[$(this).attr('data-obj')];
            	codePanel.doc.cm.refresh();
            })
            
			$('#J_SubmitBtn').on('click', function(){
				// 校验config数据
				var configData = _self.confPanel.doc.getValue();
				try{ 
					configData = $.parseJSON(configData);
				}catch(e){
					alert('Fields Config 数据有误，请填写标准json格式！');
					return false;
				}
				if(!S.isArray(configData)){
					alert('Fields Config 数据有误，应该填写一个数组！');
					return false;
				}else{
					if(configData.length > 0){
						var formatErr = false;
						S.each(configData, function(f){
							if(!f.name || !f.key || !f.type){
								formatErr = true;
								return false;
							}
						});
						if(formatErr){
							alert('Fields Config 数据格式有误，必须包含name、key、type字段！');
							return false;
						}
					}
				
				}
				// 校验 测试数据 格式
				if(_self.dataPanel){
					var testData = _self.dataPanel.doc.getValue();
					try{ 
						testData = $.parseJSON(testData);
					}catch(e){
						alert('Test Data 数据有误，请填写标准json格式！');
						return false;
					}
				}
				
				$('#J_Form')[0].submit();
				
			});

        }


    });

    Mod.init();

})($);