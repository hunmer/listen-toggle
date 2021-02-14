
var socket_url = 'ws://127.0.0.1:8000';
var connection;
var g_playing = {
	data: {
		id: null,
		source: null
	}
};
$(function() {
	if(!g_config.user){
		$('#modal_user').modal('show');
	}else{
		hsycms.loading('正在加载');
		setUser(g_config.user);
	}
});

function queryMsg(msg){
	connection.send(msg);
}

var _audio;
var _video;
var last_lrctime;
var last_pro;
var checkPlayerTimer;
function init(){
	connection = new WebSocket(socket_url);
	connection.onopen = () => {
		queryMsg('broadcast||login||'+g_config.user);
		hsycms.hideLoading();

		if(checkPlayerTimer){
			clearInterval(checkPlayerTimer);
		}
		checkPlayerTimer = setInterval(() => {
			queryMsg('list');
		}, 5000);
	}

	connection.onclose = () => {
		queryMsg('status||'+g_config.user+'||离线||bg-secondary');
	}

	connection.onerror = (error) => {
	  console.log(`WebSocket error: ${error}`);
	   hsycms.confirm('confirm','服务器连接失败！是否重新连接?',
	         function(res){            
	         	connection.close();
	         	connection = new WebSocket(socket_url)
				hsycms.loading('loading','正在加载');
	         },
	        function(res){
	         },
	      );
	}

	connection.onmessage = (e) => {
	  console.log(e.data);
	  var params = e.data.split('||');
	  switch (params[0]) {
	  	case 'msg':
	  		dom_addMsg(params[1], params[2]);
	  		break;

	  	case 'danmu':
	  		_video.danmu.sendComment(JSON.parse(params[2]));
	  		break;


	  	case 'leave':
	  		updateStatus(params[1], '离线', 'bg-secondary');
	  		break;

	  	case 'image':
	  		dom_addImage(params[1], params[2]);
	  		break;

	  	case 'list':
	  		var online;
	  		g_listPlayer = JSON.parse(params[1]);
	  		for(let name in g_datas.user){
	  			online = g_listPlayer[name] != undefined;
	  			if(online && $('[data-user="'+name+'"]').find('.badge').html() !== '离线'){
	  				// 已经在线上
	  			}else{
	  				updateStatus(name, online ? '在线' : '离线', online ? 'bg-primary' : 'bg-secondary');
	  			}
	  		}
	  		break;

	  	case 'status':
	  		updateStatus(params[1], params[2], params[3]);
	  		break;

	  	case 'broadcast':
	  		var html;
	  		switch (params[1]) {
	  			case 'login':
	  				html = '<span class="msg badge bg-dark text-light mb-2">'+params[2]+'加入了聊天室</span>';
					queryMsg('status||'+params[2]+'||在线||bg-primary');
	  				break;

	  			case 'up':
	  				html = `<span class="msg badge bg-dark text-light mb-2">  <svg data-action="up" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
  <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
</svg>`+params[2]+'赞了'+params[3]+'</span>';
	  				break;

	  			case 'down':
	  				html = `<span class="msg badge bg-dark text-light mb-2"><svg data-action="down" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-hand-thumbs-down" viewBox="0 0 16 16">
  <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964l-.261.065zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a8.912 8.912 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581 0-.211-.027-.414-.075-.581-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.224 2.224 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.866.866 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1z"/>
</svg>`+params[2]+'踩了'+params[3]+'</span>';
	  				break;

	  			case 'listen':
	  				var detail = JSON.parse(params[3]);
	  				html = `<span class="msg badge bg-dark text-white mb-2" data-type="`+detail['type']+`" data-json='`+params[3]+`'><span class="text-warning">`+params[2]+'</span>正在听<span class="text-info">'+detail['name']+`</span><svg xmlns="http://www.w3.org/2000/svg" data-action="play" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
								  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
								</svg></span>`;
	  				break;
	  			default:
	  				return;
	  		}
	  		dom_broadcast(html);
    		break;

    	case 'sendMedia':
	  		dom_addMedia(params[1], params[2]);
    		break;
	  	default:
	  		// statements_def
	  		break;
	  }
	}


	_audio = $('audio')[0];
	_audio.onerror = (e) => {
		console.log('加载失败!');
	}
	_audio.ontimeupdate = (e) => {
		var pro = parseInt(_audio.currentTime / _audio.duration * 100);
		$('.progress-bar').css('width', pro + '%');
		if(pro % 1 == 0 && last_pro != pro){
			last_pro = pro;
			queryMsg('status||'+g_config.user+'||'+pro+'%||bg-info');
		}

		var d, p;
		for(var i=g_lrcs.length;i>0;i--){
			d = g_lrcs[i-1];
			p = $('.active[data-time]');
			if(d.time <= _audio.currentTime){
				if(last_lrctime != d.time){
					last_lrctime = d.time;
					$('#music_lyric').html(`
						<span class="text-info">`+d.lrc+`</span>` + 
						(i != g_lrcs.length - 1 ? `</br><span class="">`+g_lrcs[i].lrc+`</span>` : '')
					);
				}
				return;
			}
		}
	}
	_audio.onload = (e) => {
		if(g_playing.target){
			console.log('调整到 ' + g_playing.target);
			_audio.currentTime = g_playing.target * _audio.duration;
			g_playing.target = undefined;
		}
	}
	_audio.onended = (e) => {
		_audio.currentTime = 0;
		_audio.play();
		queryMsg('status||'+g_config.user+'||结束||bg-light');
	}

	new ClipboardJS('#clipboard');
	window.history.pushState(null, null, "#");
	window.addEventListener("popstate", function(event) {
		window.history.pushState(null, null, "#");
		event.preventDefault(true);
		event.stopPropagation();
		//$('#modal1').modal('close');
	});

	$(document).on('click', '[data-action]', function(event) {
		// event.preventDefault();
		var dom = $(this);
		onAction(dom, dom.attr('data-action'));
	});
	$('.progress').click(function(event) {
		if(_audio.duration) _audio.currentTime = event.originalEvent.offsetX / $(this).width() * _audio.duration;
	});

	_video=new Player({
        id: 'mse',
        autoplay: true,
        volume: 1,
        videoInit: true,
        // fitVideoSize: 'auto',
        // miniplayer: true,
         // pip: true,
         lang: 'jp',
        url:'',
        // url:'//sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
       // poster: "//s2.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/poster.jpg",
        // playsinline: true,
        // thumbnail: {
        //     pic_num: 44,
        //     width: 160,
        //     height: 90,
        //     col: 10,
        //     row: 10,
        //     urls: ['//s3.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo-thumbnail.jpg'],
        // },
        danmu: {
          comments: [
            /*{
              duration: 15000,
              id: '1',
              start: 3000,
              txt: '长弹幕长弹幕长弹幕长弹幕长弹幕',
              style: {  //弹幕自定义样式
                color: '#ff9500',
                fontSize: '20px',
                border: 'solid 1px #ff9500',
                borderRadius: '50px',
                padding: '5px 11px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }*/
          ],
          area: {
            start: 0,
            end: 1
          }
        },
        height: 300,
        width: Window.innerWidth,
        whitelist: ['']
      });

	_video.on('error', () => {
		console.log('加载失败!');
	});
	_video.on('waiting', () => {
		queryMsg('status||'+g_config.user+'||加载中||bg-light');
	});
	_video.on('timeupdate', () => {
		var pro = parseInt(_video.currentTime / _video.duration * 100);
		if(pro % 1 == 0 && last_pro != pro){
			last_pro = pro;
			queryMsg('status||'+g_config.user+'||'+pro+'%||bg-info');
		}
	});
	_video.on('load', () => {
		if(g_playing.target){
			console.log('调整到 ' + g_playing.target);
			_video.currentTime = g_playing.target * _video.duration;
			g_playing.target = undefined;
		}
	});
	_video.on('ended', () => {
		if(_video.duration > 0){
			queryMsg('status||'+g_config.user+'||结束||bg-light');
		}
	});
	// $('#modal_music').modal();
	// search('music', '深海少女');
	 // $('#modal_link').modal();

	 // $('#modal_video').modal();
	// search('video', '深海少女');
}

function shareLink(){
	var data = {
		name: $('#input_name').val(),
		ablum: $('#input_album').val(),
		artist: $('#input_artist').val(),
		url: $('#input_link').val(),
		pic: $('#input_cover').val(),
		type: $('#modal_link option:selected').val()
	}
	console.log(data);
	queryMsg('sendMedia||'+g_config.user+"||"+JSON.stringify(data));
}

function onAction(dom, action){
	switch(action){
			case 'selectImage':
				$('#input_updload').click();
				break;

			case 'sendMedia':
				var parent = dom.parents('[data-json]');
				console.log(parent);
				var data = JSON.parse(parent.attr('data-json'));
				if(data){
					data.type = parent.attr('data-type');
				}
				queryMsg('sendMedia||'+g_config.user+"||"+JSON.stringify(data));
				$('.modal').modal('hide')
				break;

			case 'up':
				if(!dom.hasClass('text-info') && !$('[data-action=down]').hasClass('text-info')){
					dom.addClass('text-info');
					queryMsg('broadcast||up||'+g_config.user+'||'+g_playing.data.name);
				}
				break;

			case 'download':
				window.open(_audio.src, '_blank');
				break;

			case 'down':
				if(!dom.hasClass('text-info') && !$('[data-action=up]').hasClass('text-info')){
					dom.addClass('text-info');
					queryMsg('broadcast||down||'+g_config.user+'||'+g_playing.data.name);
				}
				break;

			case 'volume':
				if(_audio.volume == 1){
					_audio.volume = 0;
				}else{
					_audio.volume += 0.25;
				}
				hsycms.tips('tips', '音量 : ' + _audio.volume * 100);
				break;

			case 'switch':
				if(_audio.paused){
					_audio.play();
				}else{
					_audio.pause();
				}
				break;

			case 'play':
				parseMusic(JSON.parse(dom.parents('[data-json]').attr('data-json')));
				break;

			case 'sendDanmu':
				var msg = $('#input_text').val();
				if(msg != ''){
					$('#input_text').val('');
					var prop = {
					    duration: 15000,
					    id: 'danmu_' + new Date().getTime(),
					    start: _video.currentTime * 1000,
					    txt: g_config.user + ' : ' + msg,
					    style: {
					        color: '#ff9500',
					        fontSize: '20px',
					        border: 'solid 1px #ff9500',
					        borderRadius: '50px',
					        padding: '5px 11px',
					        backgroundColor: 'rgba(255, 255, 255, 0.1)'
					    }
					};
					queryMsg('danmu||'+g_config.user+'||'+JSON.stringify(prop));
				}
				break;

			case 'sendMsg':
				var msg = $('#input_text').val();
				if(msg != ''){
					$('#input_text').val('');
					queryMsg('msg||'+g_config.user+'||'+msg);
				}
				break;

			case 'selectMusic':
				$('#modal_music').modal('show');
				break;

			case 'selectVideo':
				$('#modal_video').modal('show');
				break;

			case 'copyMsg':
				setCopyText(dom.parents('.list-group-item').find('.msg_content').html());
				break;

			case 'inputText':
				dom.parents('.card').find('textarea').val(dom.parents('.list-group-item').find('.msg_content').html()).focus();
				break;

			case 'unknow':
				dom.parents('.card').find('textarea').val('分からない').focus();
				break;

			case 'selectUser':
				var user = dom.attr('data-user');
				var pro = parseInt(dom.find('.badge').html().replace('%', '')) / 100;
				if(pro > 0){
					pro += 0.005; //偏差
					var json = JSON.parse(g_listPlayer[user]);
					if(json['id'] != g_playing.data.id && json['source'] != g_playing.data.source){ // 不是同一首歌
						parseMusic(json);
						g_playing.target = pro;
					}else{
						_audio.currentTime = pro * _audio.duration;
					}
				}
				break;

			case 'switchAudio':
				var audio = dom.next('audio')[0];
				if(audio.paused){
					dom.attr('src', './img/audio-wave.gif')
					audio.play();
				}else{
					audio.pause();
					dom.attr('src', './img/audio-wave.png')
				}
				break;
		}

			$('.progress').click(function(event) {
				if(_audio.duration) _audio.currentTime = event.originalEvent.offsetX / $dom.width() * _audio.duration;
			});
}

function parseMusic(json){
	if(json['id'] != g_playing.data.id && json['source'] != g_playing.data.source){ // 换歌全服提示
		queryMsg('broadcast||listen||'+g_config.user+'||'+JSON.stringify(json));
	}

	g_playing.data = json;
	queryMsg('status||'+g_config.user+'||加载中||bg-light');
	if(json['type'] == 'music'){
		$('[data-action="sendDanmu"]').css('display', 'none');
		_video.src = '';
		$('#mse').hide();
		$('.player').show();
		$('#music_name').html(json['name'] + '/' + json['artist']);
		$('#music_lyric').html('歌词加载中..');
		$('#music_cover').attr('src', json['pic']);
		setPlaying(json['url'] ? json['url'] : './api/search.php?server='+json['source']+'&type=url&id='+json['id']);
		searchLyric('./api/search.php?server='+json['source']+'&type=lyric&id='+json['id']);
	}else
	if(json['type'] == 'video'){
		$('#mse').show();
		_audio.src = '';
		$('.player').hide();
		$('[data-action="sendDanmu"]').css('display', 'unset');

		_video.poster = json['pic'];
		_video.src = json['url'] ? json['url'] : './api/video.php?server='+json['source']+'&type=url&id='+json['id'];
		_video.autoplay = true;
	}
}

function updateStatus(user, status, color = 'bg-info'){
	$('[data-user="'+user+'"]').find('span').html(status)[0].className = 'badge ' + color;
}

function uploadImage(file){
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
			queryMsg('image||'+g_config.user+'||'+ e.currentTarget.result);
		}
}

function dom_addImage(userName, data){
	$('.container').append(`<div class="msg float-right"'>
  	<img src="img/`+userName+`.jpg" width="45px" height="45px" class="user_cover">
  	<div class="alert alert-primary msg_content" role="alert" >
  		<div class="arrow"></div>
  		<img src=`+data+` class="w-100">
	</div>
  </div>`);
}
function dom_addMedia(userName, data){
	var detail = JSON.parse(data); 
	var html;
	switch (detail['type']) {
		case 'music':
			html = `
			<div class="card" style="width: 18rem;">
			  <img src='`+detail['pic']+`' height="300px" class="card-img-top" alt="...">
			  <div class="card-body">
			    <h5 class="card-title"> `+detail['name']+`</h5>
			    <p class="card-text">`+detail['album']+`</p>
			    <p class="card-text">`+detail['artist']+`</p>
			    <a href="javascript: void(0)" class="btn btn-primary float-right"><svg xmlns="http://www.w3.org/2000/svg" data-action="play" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
				  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
				</svg></a>
			  </div>
			</div>
			`;
			break;

		case 'video':
			html = `
			<div class="card" style="width: 18rem;">
			  <img src='`+detail['pic']+`' height="300px" class="card-img-top" alt="...">
			  <div class="card-body">
			    <h5 class="card-title"> `+detail['name']+`</h5>
			    <p class="card-text">`+detail['artist']+`</p>
			    <a href="javascript: void(0)" class="btn btn-primary float-right"><svg xmlns="http://www.w3.org/2000/svg" data-action="play" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
				  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
				</svg></a>
			  </div>
			</div>
			`;
			break;
	}
	if(html){
		$('.container').append(`<div class="msg float-right" data-type="`+detail['type']+`" data-json='`+data+`'>
	  	<img src="img/`+userName+`.jpg" width="45px" height="45px" class="user_cover">
	  	<div class="alert alert-primary msg_content" role="alert" >
	  		<div class="arrow"></div>
	  		`+html+`
		</div>
	  </div>`);
	}
}

function dom_addMsg(userName, msg){
	$('.container').append(`<div class="msg float-right ">
  	<img src="img/`+userName+`.jpg" width="45px" height="45px" class="user_cover" title="`+userName+`">
  	<div class="alert alert-primary msg_content" role="alert" >
  		<div class="arrow"></div>
  		`+msg+`
	</div>
  </div>`);
}

function dom_broadcast(html){
	$('.container').append(`<div class="msg w-100 text-center">`+html+`</span></div>`);
}

function setCopyText(text){
	$('#clipboard_content').val(text);
	$('#modal_copy').modal('show');
}

function confirm(text, params = {
	ok: function(){},
	cancel: function(){},
	ok_text: 'done',
	cancel_text: 'cancel'
}){
  hsycms.confirm('confirm',text,
     function(res){       
     	params.ok();     
       hsycms.success('success',params.ok_text);
     },
    function(res){
    	console.log(params);
    	params.cancel();
        hsycms.error('error',params.cancel_text);
     },
  )
}

function audio_timeUpdate(audio){
	var progress = Math.round(audio.currentTime / audio.duration * 100);
	if(progress == 100) progress = 0;
	$(audio).parent().find('.progress-bar').css('width', progress + '%');
}

function showUI(id) {
    $('.container').each(function(index, el) {
        if (el.id == id) {
            $(el).removeClass('hide');
        } else {
            $(el).addClass('hide');
        }
    });
}

function setFormTip(dom, success = false, tip = ''){
	dom.removeClass('is-valid').removeClass('is-invalid');
	dom.addClass(success ? 'is-valid' : 'is-invalid').next(success ? '.valid-feedback' : '.invalid-feedback').html(tip);
}

function checkUser(){
	var dom = $('#input_user');
	var val = dom.val();
	if(g_datas.user[val] != undefined){
		$('.container').show();
		setUser(val);
		 hsycms.success('success', '暗号正解！');
        setFormTip(dom, true, '暗号正解！');
        setTimeout(function(){
        	$('#modal_user').modal('hide');
        })
	}else{
        hsycms.error('error','暗号無効！');
        setFormTip(dom, false, '暗号無効！');
	}
}

function setUser(user){
		g_config.user = user;
		if(!user) user = 'default;'
		local_saveJson('config', g_config);
		var brand = $('.navbar-brand');
        brand.find('span').html(user == 'default;' ? '' : g_datas.user[user].name);
		brand.find('img').attr('src', user == 'default;' ? './img/default.png' : g_datas.user[user].icon);
		init();
}

function loginOut(){
	setUser();
	checkLogin();
}

function checkLogin(){
	if(!g_config.user){
		$('.container').hide();
		$('#modal_user').modal({
			backdrop: 'static',
			keyboard: false
		}).modal('show');
		return;
	}else{
		$('.container').show();
		setUser(g_config.user);
	}
}


function search(type, name){
	//$('#input_'+type).val(name);
	var html;
	// ,'kugou' 'baidu'
	if(type == 'music'){
	for(var site of ['netease', 'tencent', 'xiami', 'youtube']){
		$.getJSON('api/search.php?server='+site+'&type=search&name='+name, function(json, textStatus) {
			if(textStatus == 'success'){
				html = '';
				for(var detail of json){
					if(typeof(detail['artist']) == 'object'){
						detail['artist'] = detail['artist'].join('&');
						detail['pic'] = './api/search.php?server='+detail['source']+'&type=cover&id='+detail['pic_id'];
					}else{ // youtube
						detail['album'] = ''; // 没有专辑信息
					}
					html += `<li class="list-group-item" data-type="music" data-json='`+JSON.stringify(detail)+`'>
					  	<div class="row">
					  		<div class="col-3">
					      		<img class="lazyload" src='`+detail['pic']+`' width="100px" height="100px">
					  			
					  		</div>
					  		<div class="col-9 text-left" style="line-height: 33px;">
					  			歌名: `+detail['name']+`</br>
					  			专辑: `+detail['album']+`</br>
					  			歌手: `+detail['artist']+`
					  		</div>
					  		
					  	</div>
					  	<div class="d-flex justify-content-end">
					  			<svg xmlns="http://www.w3.org/2000/svg" data-action="play" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
								  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
								</svg>
								<button data-action="sendMedia" class="btn btn-primary">Send</button>
					  		</div>
					  </li>`;
				}
				$('#list_'+type+' ul').append(html).
				find('.lazyload').lazyload({effect: "fadeIn"});
			}
		});
	}}else
	if(type == 'video'){
		$.getJSON('api/video.php?server=youtube&type=search&name='+name, function(json, textStatus) {
			if(textStatus == 'success'){
				html = '';
				for(var detail of json){
					html += `<li class="list-group-item" data-type="video" data-json='`+JSON.stringify(detail)+`'>
					  	<div class="row">
					  		<div class="col-3">
					      		<img class="lazyload" src='`+detail['pic']+`' width="100px" height="100px">
					  			
					  		</div>
					  		<div class="col-9 text-left" style="line-height: 33px;">
					  			标题: `+detail['name']+`</br>
					  			频道: `+detail['artist']+`
					  		</div>
					  		
					  	</div>
					  	<div class="d-flex justify-content-end">
								<button data-action="sendMedia" class="btn btn-primary">Send</button>
					  		</div>
					  </li>`;
				}
				$('#list_'+type+' ul').append(html).
				find('.lazyload').lazyload({effect: "fadeIn"});
			}
		});
	}
}

function setPlaying(url){
	$('.progress-bar').css('width', '0%')
	_audio.src = url;
	_audio.autoplay = true;
	console.log('playUrl', url);
}

var g_lrcs = [];

function searchLyric(url){
	g_lrcs = [];
	$.getJSON(url, function(json, textStatus) {
		if(textStatus == 'success'){
			console.log(json);
			var lrc, tlrc, time, detail;
			if(json.lyric) lrc = json.lyric.split("\n");
			if(json.tlyric) tlrc = json.tlyric.split("\n");
			for(var i in lrc){
				time = getText(lrc[i], '[', ']');
				detail = {
					time: getTime(time),
					lrc: lrc[i].replace('['+time+']', ''),
					tlrc: undefined,
				};
				if(detail.lrc){ // 去除空文本
					if(tlrc){
						for(var t of tlrc){
							if(t.indexOf('['+time+']') == 0){
								detail.tlrc = t.replace('['+time+']', '');
								break;
							}
						}
					}
					g_lrcs.push(detail);
				}
			}
		}
	});
}


function getTime(t){ // 00:00.460
	var a = t.split(':');
	return parseInt(a[0]) * 60 + a[1] * 1;
}

function getText(text, s, e){
	var i_s = text.indexOf(s);
	if(i_s != -1){
		i_s++;
		var i_e = text.indexOf(e, i_s);
		if(i_e != -1){
			return text.substr(i_s, i_e - i_s);
		}
	}
	return '';
}
