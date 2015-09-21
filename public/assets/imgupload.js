var myDropzone = new Dropzone(".dropzone", {
    url: "/img/upload",
    acceptedFiles : "image/*",
    maxFilesize: 1,
    fallback: function(){
        alert('姐姐，对自己好一点，用个好点的浏览器吧');
    },
    init: function(){
        this.on('success',function(file, result, res){
            $(file.previewElement).append('<button class="copy" type="button" title="复制链接到">复制链接</button>');
            var client = new ZeroClipboard($(file.previewElement).find(".copy"));
            client.on( 'ready', function(event) {
                client.on( 'copy', function(event) {
                    event.clipboardData.setData('text/plain', result.url);
                });
                client.on( 'aftercopy', function(event) {
                    $(file.previewElement).find(".copy").addClass('blue').text('复制成功');
                });
            });
        }).on('canceled',function(){
        }).on('error',function(file, result){
            
        })
    }
});
