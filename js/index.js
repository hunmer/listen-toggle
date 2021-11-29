// var api_url = '.';
var socket_url = 'wss://listen-toggle-websocket.glitch.me';
// var socket_url = 'ws://192.168.1.3:8000';
var api_url = 'https://listen-toggle.glitch.me';
var connection;
var g_listPlayer = {};
var g_playing = {
    data: {
        id: null,
        source: null
    }
};
$(function() {
    // initWebsock();
    
    if (!g_config.user) {
        $('#modal_user').modal('show');
    } else {

        setUser(g_config.user);
    }
});


function queryMsg(msg, debug = false) {
    connection.send(msg);
    if (debug) console.log(debug);
}

function recon() {
    initWebsock();
}

function checkOnline() {
    var online;
    for (let name in g_datas.user) {
        online = g_listPlayer[name] != undefined;
        if (online && $('[data-user="' + name + '"]').find('.badge').html() !== 'offline') {
            // 已经在线上
        } else {
            updateStatus(name, online ? 'online' : 'offline', online ? 'bg-primary' : 'bg-secondary');
        }
    }
}

var _audio;
var _audio2;
var _video;
var last_lrctime;
var last_pro;
var checkPlayerTimer;
var g_b_inited = false;
var g_b_connected = false;
function initWebsock() {
    console.log('init');
    if (connection != undefined) {
        connection.close();
    }
    connection = new WebSocket(socket_url);
    connection.onopen = () => {
    	queryMsg('broadcast||login||' + g_config.user+(g_b_connected ? '||recon' : ''));
    	if(g_b_connected) return;
    		g_b_connected = true;

        //hsycms.hideLoading();
        x0p({
            title: '認証成功',
            text: 'おかえりなさい',
            animationType: 'pop',
            icon: 'ok',
            buttons: [],
            autoClose: 1500
        });

        if (checkPlayerTimer) {
            clearInterval(checkPlayerTimer);
        }
        checkPlayerTimer = setInterval(() => {
            queryMsg('list');
        }, 5000);
        queryMsg('list');
        checkOnline();
        if (a_get['data']) {
            parseMusic(JSON.parse(a_get['data']));
        }
    }

    connection.onclose = () => {
        recon();
    }

    connection.onerror = (error) => {
        recon();
    }

    connection.onmessage = (e) => {
        // console.log(e.data);
        var params = e.data.split('||');
        switch (params[0]) {
            case 'voice':
                dom_addMsg(params[1], '<audio id="record" src="' + params[2] + '" onload="this.volume = 1;_video.video.volume = 0.25;" onended="_video.video.volume = 1;" controls autoplay></audio>');
                console.log('<audio id="record" src="' + params[2] + '" ontimeupdate="this.volume = 1;_video.video.volume = 0.2;" onended="_video.video.volume = 1;" controls autoplay></audio>');
                break;
            case 'msg':
                dom_addMsg(params[1], params[2]);
                break;

            case 'danmu':
                _video.danmaku.sendDanmu(JSON.parse(params[2]));
                break;

            case 'leave':
                updateStatus(params[1], 'offline', 'bg-secondary');
                break;

            case 'image':
                dom_addImage(params[1], params[2]);
                break;

            case 'list':
                g_listPlayer = JSON.parse(params[1]);
                checkOnline();
                break;

            case 'status':
                updateStatus(params[1], params[2], params[3]);
                break;

            case 'broadcast':
                var html;
                switch (params[1]) {
                    case 'login':
                    	if(params.length == 4) return;
                        html = '<span class="msg badge text-center text-light mb-2"><span class="bg-dark p-2">[' + params[2] + '] チャットルームに参加しました。</span></span>';
                        queryMsg('status||' + params[2] + '||online||bg-primary');
                        break;

                    case 'up':
                        html = `<span class="msg badge text-center text-light mb-2"><span class="bg-success p-2"><svg data-action="up" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
  <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.964.22.817.533 2.512.062 4.51a9.84 9.84 0 0 1 .443-.05c.713-.065 1.669-.072 2.516.21.518.173.994.68 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.162 3.162 0 0 1-.488.9c.054.153.076.313.076.465 0 .306-.089.626-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.826 4.826 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.616.849-.231 1.574-.786 2.132-1.41.56-.626.914-1.279 1.039-1.638.199-.575.356-1.54.428-2.59z"/>
</svg>` + params[2] + 'が' + params[3] + 'いいねをしました</span></span>';
                        break;

                    case 'down':
                        html = `<span class="msg badge text-center text-light mb-2"><span class="bg-danger p-2"><svg data-action="down" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-hand-thumbs-down-fill" viewBox="0 0 16 16">
  <path d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.378 1.378 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51.136.02.285.037.443.051.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.896 1.896 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2.094 2.094 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.162 3.162 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.823 4.823 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591z"/>
</svg>` + params[2] + 'は' + params[3] + 'が普通だと思う</span></span>';
                        break;

                    case 'listen':
                        var detail = JSON.parse(params[3]);
                        html = `<span class="msg badge text-center text-light mb-2" data-type="` + detail['type'] + `" data-json='` + params[3] + `'><span class="bg-dark p-2">` + params[2] + ' playing <span class="text-white">' + detail['name'] + `</span><svg xmlns="http://www.w3.org/2000/svg" data-action="play" width="20" height="20" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                                  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                </svg></span></span>`;
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
}

function init() {
    if (g_b_inited) return;
    g_b_inited = true;
    x0p({
        title: 'loading',
        text: '読み込み中...',
        animationType: 'slideDown',
        icon: 'info',
        buttons: [],
        autoClose: 999999
    });

    _audio2 = $('#audio_tip')[0];

    initWebsock();


    _audio = $('audio')[0];
    _audio.onerror = (e) => {
        // queryMsg('status||' + g_config.user + '||faild||bg-danger');
    }
    _audio.ontimeupdate = (e) => {
        var pro = _audio.currentTime / _audio.duration * 100;
        $('.progress-bar').css('width', parseInt(pro) + '%');
        //if(pro % 1 == 0 && last_pro != pro){
        //  last_pro = pro;
        queryMsg('status||' + g_config.user + '||' + pro + '||bg-info');
        //}

        var d, p;
        for (var i = g_lrcs.length; i > 0; i--) {
            d = g_lrcs[i - 1];
            p = $('.active[data-time]');
            if (d.time <= _audio.currentTime) {
                if (last_lrctime != d.time) {
                    last_lrctime = d.time;
                    $('#music_lyric').html(`
                        <span class="text-info">` + d.lrc + `</span>` +
                        (i != g_lrcs.length - 1 ? `</br><span class="">` + g_lrcs[i].lrc + `</span>` : '')
                    );
                }
                return;
            }
        }
    }


    _audio.onload = (e) => {
        if (g_playing.target) {
            console.log('调整到 ' + g_playing.target);
            _audio.currentTime = g_playing.target * _audio.duration;
            g_playing.target = undefined;
        }
    }
    _audio.onended = (e) => {
        _audio.currentTime = 0;
        _audio.play();
        queryMsg('status||' + g_config.user + '||終了||bg-light');
    }

    window.history.pushState(null, null, "#");
    window.addEventListener("popstate", function(event) {
        window.history.pushState(null, null, "#");
        event.preventDefault(true);
        event.stopPropagation();
        $('.modal').modal('hide');
    });


    $(document).on('click', '[data-action]', function(event) {
        // event.preventDefault();
        var dom = $(this);
        onAction(dom, dom.attr('data-action'));
    })
    /*   .on('focus', '#input_danmu', function(event) { // 输入弹幕时强制不隐藏控件栏
              $("#mse > div > div:nth-child(2)").addClass('_show');
              $("#mse > div > div:nth-child(3)").addClass('_show');
       })
       .on('blur', '#input_danmu', function(event) {
               $('._show').removeClass('_show');
       });*/
    $('.progress').click(function(event) {
        if (_audio.duration) _audio.currentTime = event.originalEvent.offsetX / $(this).width() * _audio.duration;
    });

    $(window).resize(function(event) {
        var w = $(this).width();
        var h = $(this).height();
        if (w > h) {
            $('#container').addClass('width'); // 显示滚动条
            $('#view').addClass('width-view');

            if (h < 600) {
                $('#inputArea').addClass('inputArea_top');
            } else {
                $('#inputArea').removeClass('inputArea_top');
            }
        } else {

            $('#inputArea').removeClass('inputArea_top');
            $('#container').removeClass('width').removeClass('_normal').css('height', '');
            $('#view').removeClass('width-view');

            if (h < 720) {
                $('#danmu_bar, #icon_bar').hide();
            } else {
                $('#danmu_bar, #icon_bar').show();
            }
        }
    }).resize();


    $('.player').hide();
    // $('#modal_music').modal();
    // search('music', '深海少女');
    // $('#modal_link').modal();

    // $('#modal_video').modal();
    // search('video', '深海少女');
    // <button class="btn btn-primary mt-2 pl-1 pr-1" onclick="$('#modal_danmu').modal('show')">弹</button>

    // {name: "", ablum: "", artist: "", url: "https://www.youtube.com/watch?v=d86hKJNehI8", pic: "./img/cover.webp", …}

}


var g_sub_last;

function loadedHandler() {
    var player = _video.isVideo != undefined ? $(_video.video) : _video;
    //调用到该函数后说明播放器已加载成功，可以进行部分控制了。此时视频还没有加载完成，所以不能控制视频的播放，暂停，获取元数据等事件
    player.on('error', () => {
        //queryMsg('status||' + g_config.user + '||faild||bg-danger');
    });
    player.on('timeupdate', () => {
        var current = _video.video.currentTime;
        // if (g_b_sub) {
        //     var find = false;
        //     for (var sub of g_subs) {
        //         if (current >= sub['start'] && current < sub['end']) {
        //             find = true;
        //             if (g_sub_last != sub.text) {
        //                 g_sub_last = sub.text;
        //                 // console.log(sub.text);
        //                 $('.dplayer-subtitle p').show().html(sub.text);
        //             }
        //         }

        //     }
        //     if (!find) {
        //         $('.dplayer-subtitle p').hide();
        //     }
        // }
        var pro = current / _video.video.duration * 100;
        if (!isNaN(pro)) {
            queryMsg('status||' + g_config.user + '||' + pro + '||bg-info');

        }
    });
    $(player).on('canplay', () => {
        queryMsg('status||' + g_config.user + '||ok||bg-success');

    });
    player.on('loadstart', () => {
        queryMsg('status||' + g_config.user + '||ok||bg-success');
        /*if (g_playing.target) {
            console.log('调整到 ' + g_playing.target);
            _video.video.currentTime = g_playing.target * _video.video.duration;
            g_playing.target = undefined;
        }*/
    });
    player.on('ended', () => {
        if (_video.video.duration > 0) {
            queryMsg('status||' + g_config.user + '||終了||bg-light');
        }
    });
    if (player.danmaku) {
        player.danmaku.sendDanmu = player.danmaku.send;
        player.danmaku.send = (o, f) => {
            $('.dplayer-comment-input').val('');
            sendDanmu(o.text, o.color, o.type);
            return false;
        }
    }

    setInterval(() => {
        if (g_b_sub) {
            var current = _video.video.currentTime;
            var find = false;
            var res = [];
            for (var sub of g_subs) {
                if (current >= sub['start'] && current < sub['end']) {
                    find = true;
                    if (g_sub_last != sub.text) {
                        g_sub_last = sub.text;
                        res.push(sub.text);
                        // console.log(sub.text);
                    }
                }

            }
            if (!find) {
                $('.dplayer-subtitle p').hide();
            }else{
                if(res.length) $('.dplayer-subtitle p').show().html(res.join("<br>").replaceAll('\r\n', '<br>').replaceAll('\n', '<br>'));
            }
        }
    }, 250);

    /*  _video.on('full', (b) => {
         if(b){ // 全屏显示弹幕输入控件
             $('[data-title=点击播放]').parent().append($(`<input clas="mt-2" style="width: 300px;margin-top: 5px;margin-left:200px" type="text" id="input_danmu" placeholder="ご感想を" onkeydown="if(event.keyCode == 13 && !event.ctrlKey){sendDanmu(this.value);this.value = '';}">`));
         }else{
             $('#input_danmu').remove();
         }
     });*/

    $('.dplayer-icons.dplayer-icons-right').prepend(`
        <div class="dplayer-comment" id='recorder_btn' onclick="switchRecord();">
                    <button class="dplayer-icon dplayer-comment-icon">
                        <span class="dplayer-icon-content"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32" style="width: 37px; height: 37px">
              <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
              <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
            </svg></span>
                    </button>
                </div>
                <div class="dplayer-comment" id="recorder_cnt" style="display: none" title="秒数">
                    <span style="color: white;">0s</span>
                </div>
                <div class="dplayer-comment" style="display: none" id='recorder_play_btn' onclick="document.querySelector('#record1').play();" title="再生">
                    <button class="dplayer-icon dplayer-comment-icon">
                        <span class="dplayer-icon-content">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32" style="width: 37px; height: 37px">
  <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
</svg></span>
                    </button>
                </div>
                <div class="dplayer-comment" style="display: none" id='recorder_play_send' onclick="sendRecord();" title="送信">
                    <button class="dplayer-icon dplayer-comment-icon">
                        <span class="dplayer-icon-content">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32" style="width: 37px; height: 37px">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
</svg></span>
                    </button>
                </div>
                `);

}



function loadVideo(url, poster = '', sub = '') {
    if (!poster) poster = '.img/loading.gif';
    if (url.indexOf('youtube') != -1 || url.indexOf('googlevideo.com') != -1) {
        if (_video && _video.isVideo == undefined) _video.destroy();
        $('#mse').html('<video src="' + url + '" poster="' + poster + '" style="width: 100%;height: 100%;" autoplay controls></video>');
        _video = {
            video: $('video')[0],
            isVideo: true,
        };
        loadedHandler();
        return;
    }
    var config = {
        container: $('#mse')[0],
        autoplay: true,
        volume: 1,
        lang: 'en',
        video: {
            url: url,
            pic: poster,
        },
        danmaku: {
            id: 'demo',
        },
        // subtitle: {
        //     url: sub,
        //     type: 'webvtt',
        //      fontSize: '30px',
        //   bottom: '10%',
        //   color: '#b7daff',
    }

    if (sub) {
        loadSub(sub);
    }
    if (!_video || _video.isVideo) {
        _video = new DPlayer(config);
        loadedHandler();
    } else {
        _video.switchVideo(config.video);
    }
}

function loadSub(sub, reset = true){
    $.ajax({
            url: sub,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            success: function(data) {
                if(reset) g_subs = [];
                var arr = data.replaceAll("</br>", "\n").replaceAll("\r\n", "\n").split("\n");
                if (arr[0].toLocaleUpperCase().indexOf('WEBVTT') == 0) {
                    var data = [];
                    for (var line of arr) {
                        line = line.trim();
                        if (line != '') {
                            if (line.indexOf(' --> ') != -1) {
                                if (data['text'] != undefined) {
                                    g_subs.push(data);
                                    data = { 'text': '' };
                                }
                                time = line.split(' --> ');
                                if (time.length == 2) {
                                    data['start'] = toTime(time[0]);
                                    data['end'] = toTime(time[1]);

                                }
                            } else {
                                data['text'] += (data['text'] != '' ? '\r\n' : '') + line;
                            }
                        }
                    }
                    if (data['text'] != undefined) {
                        g_subs.push(data);
                    }
                }
                g_b_sub = g_subs.length;
                if (!$('.dplayer-subtitle p').length) {
                    $('.dplayer-subtitle').css({
                        height: '17%',
                        fontSize: '2rem',
                        minHeight: '50px',
                        bottom: '0',
                        color: 'rgb(183, 218, 255)',
                    }).show().append('<p style="width: 100%;"></p>').find('p').css('text-shadow', '2px 2px 0px blue');
                }
            },
            error: function(request, status, error) {
                console.log('加载字幕失败');
            }
        })
}

var g_subs = [];
var g_b_sub = false;

function shareLink() {
    var url = $('#input_link').val();
    var id = cutString(url + '&', 'v=', '&');
    var cover = $('#input_cover').val();
    var name = $('#input_name').val();
    if (cover == '') {
        cover = id ? 'https://i.ytimg.com/an_webp/' + id + '/mqdefault_6s.webp' : './img/cover.webp';
    }
    var data = {
        name: name || 'no title',
        ablum: $('#input_album').val(),
        artist: $('#input_artist').val(),
        url: ($('#share_select')[0].selectedIndex == 0 ? 'https://alltubedownload.net/download?url=' : '') + url,
        pic: cover,
        sub: $('#input_sub').val(),
        type: $('#modal_link option:selected').val()
    };
    console.log('sendMedia||' + g_config.user + "||" + JSON.stringify(data));
    queryMsg('sendMedia||' + g_config.user + "||" + JSON.stringify(data));
    $('#modal_link').modal('hide');
}

function onAction(dom, action) {
    switch (action) {
        case 'selectImage':
            $('#input_updload').click();
            break;

        case 'sendMedia':

            var parent = dom.parents('[data-json]');
            var data = JSON.parse(parent.attr('data-json'));
            if (data) {
                data.type = parent.attr('data-type');
            }
            queryMsg('sendMedia||' + g_config.user + "||" + JSON.stringify(data), true);
            $('.modal').modal('hide')
            break;

        case 'up':
            if (!g_playing.data.name) return;
            if (!dom.hasClass('text-info') && !$('[data-action=down]').hasClass('text-info')) {
                dom.addClass('text-info');
                queryMsg('broadcast||up||' + g_config.user + '||' + g_playing.data.name);
            }
            break;

        case 'sendDanmu':
            var msg;
            var dm = $('#danmu_selecter option:selected');
            if (dm.length > 0 && !dm.prop('disabled')) {
                msg = dm.html();
                $('#danmu_selecter option:nth-child(1)').prop('selected', true);
            } else {
                msg = $('#input_text').val();
                $('#input_text').val('');
            }
            if (msg != '') {
                sendDanmu(msg);
            }
            break;


        case 'fitler_site':
            var site = dom.val();
            var selected = dom.prop('checked');
            dom.parents('.modal-body').find('ul li').each((i, d) => {
                if ($(d).attr('data-source') == site) {
                    $(d).css('display', selected ? 'unset' : 'none');
                }
            });
            break;

        case 'download':
            if (_audio.src) window.open(_audio.src, '_blank');
            break;

        case 'down':
            if (!g_playing.data.name) return;
            if (!dom.hasClass('text-info') && !$('[data-action=up]').hasClass('text-info')) {
                dom.addClass('text-info');
                queryMsg('broadcast||down||' + g_config.user + '||' + g_playing.data.name);
            }
            break;

        case 'volume':
            if (_audio.volume == 1) {
                _audio.volume = 0;
            } else {
                _audio.volume += 0.25;
            }
            //hsycms.tips('tips', '音量 : ' + _audio.volume * 100);
            break;

        case 'switch':
            if (_audio.paused) {
                _audio.play();
            } else {
                _audio.pause();
            }
            break;

        case 'play':
            parseMusic(JSON.parse(dom.parents('[data-json]').attr('data-json')));
            break;

        case 'sendMsg':
            var msg = $('#input_text').val();
            if (msg != '') {
                $('#input_text').val('');
                queryMsg('msg||' + g_config.user + '||' + msg);
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

        case 'selectUser':
            var user = dom.attr('data-user');
            var pro = dom.find('.badge').attr('data-time') / 100;
            if (pro > 0) {
                pro += 0.0005; //偏差
                var json = JSON.parse(g_listPlayer[user]);
                if (JSON.stringify(json) != JSON.stringify(g_playing.data)) { //不是同一首歌
                    parseMusic(json);
                    g_playing.target = pro;
                } else {
                    if (g_playing.data.type == 'video') {
                        _video.video.currentTime = pro * _video.video.duration;
                    } else {
                        _audio.currentTime = pro * _audio.duration;
                    }
                }
            }
            break;

    }

    $('.progress').click(function(event) {
        if (_audio.duration) _audio.currentTime = event.originalEvent.offsetX / $(this).width() * _audio.duration;
    });

}

function sendDanmu(msg, color = '#b7daff', type = 'right') {
    // $('.navbar-brand img').attr('src')
    queryMsg('danmu||' + g_config.user + '||' + JSON.stringify({
        text: g_config.user + ':' + msg,
        color: color,
        type: type, // should be `top` `bottom` or `right`
    }));
}

function parseMusic(json) {
    if (JSON.stringify(json) != JSON.stringify(g_playing.data)) { // 换歌全服提示
        $('[data-action=up]').removeClass('text-info');
        $('[data-action=down]').removeClass('text-info');
        queryMsg('broadcast||listen||' + g_config.user + '||' + JSON.stringify(json));
    }

    g_playing.data = json;
    queryMsg('status||' + g_config.user + '||loading||bg-light');
    if (json['type'] == 'music') {
        if (_video) _video.video.src = '';
        $('#danmu_bar').hide();
        $('#mse').hide();
        $('.player').show();
        $('#music_name').html(json['name'] + '/' + json['artist']);
        $('#music_lyric').html('loading..');
        $('#music_cover').attr('src', json['pic']);
        setPlaying(json['url'] ? json['url'] : api_url + '/api/search.php?server=' + json['source'] + '&type=url&id=' + json['id']);
        searchLyric(api_url + '/api/search.php?server=' + json['source'] + '&type=lyric&id=' + json['id']);
    } else
    if (json['type'] == 'video') {
        $('#mse').show();
        _audio.src = '';
        $('.player').hide();

        loadVideo(json['url'] ? json['url'] : api_url + '/api/video.php?server=' + json['source'] + '&type=url&id=' + json['id'], json['pic'], json['sub']);
        $('#danmu_bar').show();
    }
}

function updateStatus(user, status, color = 'bg-dark') {
    var span = $('[data-user="' + user + '"]').find('span');
    if (color == 'bg-info') { // 时间特定
        span.attr('data-time', status); // 标记时间
        status = parseInt(status) + '%'; // 取整数
    }
    span.html(status)[0].className = 'badge ' + color;
}

function uploadImage(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        queryMsg('image||' + g_config.user + '||' + e.currentTarget.result);
    }
}

function dom_addImage(userName, data) {
    insertHtml(`<div class="msg float-right"'>
    <img src="img/` + userName + `.jpg" width="45px" height="45px" class="user_icon">
    <div class="alert alert-primary msg_content" role="alert" >
        <div class="arrow"></div>
        <img src=` + data + ` class="w-100">
    </div>
  </div>`);
}

function soundTip(url) {
    _audio2.src = url;
    _audio2.play();
}

function dom_addMedia(userName, data) {
    var detail = JSON.parse(data);
    var html;

    switch (detail['type']) {
        case 'music':
            html = `
            <div class="card mb-2" style="width: 18rem;margin: 0 auto;" data-json='` + data + `'>
              <img src='` + detail['pic'] + `' height="300px" class="card-img-top" alt="...">
              <div class="card-body">
                 <div style="width: 100%;margin: 0 auto;display: inline-grid">
                    <img class="user_icon" src="` + g_datas.user[userName].icon + `" style="margin: 0 auto;">
                </div>
                <h5 class="card-title"> ` + detail['name'] + `</h5>
                <p class="card-text">` + detail['album'] + `</p>
                <p class="card-text">` + detail['artist'] + `</p>
                <a href="javascript: void(0)" class="btn btn-primary float-right"><svg xmlns="http://www.w3.org/2000/svg" data-action="play" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg></a>
              </div>
            </div>
            `;
            break;

        case 'video':
            html = `
            <div class="card mb-2" style="width: 18rem;margin: 0 auto;" data-json='` + data + `'>
              <img src='` + detail['pic'] + `' height="300px" class="card-img-top" alt="...">
              <div class="card-body">
                 <div style="width: 100%;margin: 0 auto;display: inline-grid">
                    <img class="user_icon" src="` + g_datas.user[userName].icon + `" style="margin: 0 auto;">
                </div>
                <h5 class="card-title"> ` + detail['name'] + `</h5>
                <p class="card-text">` + detail['artist'] + `</p>
                <a href="javascript: void(0)" class="btn btn-primary float-right"><svg xmlns="http://www.w3.org/2000/svg" data-action="play" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg></a>
              </div>
            </div>
            `;
            break;
    }
    if (html) {
        insertHtml(html);
    }
}

function dom_addMsg(userName, msg) {
    insertHtml(`<div class="msg">
    <img src="img/` + userName + `.jpg" class="user_icon" title="` + userName + `">
    <div class="con">
        <div class="alert alert-primary msg_content" role="alert" >
            <div class="arrow"></div>
           ` + msg + `
        </div>
    </div>
  </div>`);
}

function dom_broadcast(html) {
    insertHtml(`<div class="msg w-100 text-center">` + html + `</span></div>`);
}

function insertHtml(html) {
    var con = $('#container').append(html);
    var h = con[0].scrollHeight;
    con.animate({ scrollTop: h + 'px' }, 0);;
    if (h > $(window).height() - 60 && con.hasClass('width')) {
        con.addClass('_normal'); // 显示滚动条
    } else {
        if (con.hasClass('width')) {
            con.removeClass('_normal').height(h); // 扩大高度
        }
    }
    soundTip('./res/pop.mp3');
}


function audio_timeUpdate(audio) {
    var progress = Math.round(audio.currentTime / audio.duration * 100);
    if (progress == 100) progress = 0;
    $(audio).parent().find('.progress-bar').css('width', progress + '%');
}

function showUI(id) {
    $('#container').each(function(index, el) {
        if (el.id == id) {
            $(el).removeClass('hide');
        } else {
            $(el).addClass('hide');
        }
    });
}

function setFormTip(dom, success = false, tip = '') {
    dom.removeClass('is-valid').removeClass('is-invalid');
    dom.addClass(success ? 'is-valid' : 'is-invalid').next(success ? '.valid-feedback' : '.invalid-feedback').html(tip);
}

function checkUser() {
    var dom = $('#input_user');
    var val = dom.val();
    if (g_datas.user[val] != undefined) {
        $('#container').show();
        setUser(val);
        x0p({
            title: '暗号正解！',
            text: 'いらっしゃいませ',
            animationType: 'slideDown',
            icon: 'ok',
            buttons: [],
            autoClose: 1000
        });
        setFormTip(dom, true, '暗号正解！');
        setTimeout(function() {
            $('#modal_user').modal('hide');
        })
    } else {
        x0p({
            title: '暗号無効！',
            text: 'xxx',
            animationType: 'slideDown',
            icon: 'error',
            buttons: [],
            autoClose: 1000
        });
        setFormTip(dom, false, '暗号無効！');
    }
}

function setUser(user) {
    g_config.user = user;
    if (!user) user = 'default;'
    local_saveJson('config', g_config);
    var brand = $('.navbar-brand');
    brand.find('span').html(user == 'default;' ? '' : g_datas.user[user].name);
    brand.find('img').attr('src', user == 'default;' ? './img/default.png' : g_datas.user[user].icon);
    init();
}

function loginOut() {
    setUser();
    checkLogin();
}

function checkLogin() {
    if (!g_config.user) {
        $('#container').hide();
        $('#modal_user').modal({
            backdrop: 'static',
            keyboard: false
        }).modal('show');
        return;
    } else {
        $('#container').show();
        setUser(g_config.user);
    }
}


function search(type, name) {
    //$('#input_'+type).val(name);
    var html;
    // ,'kugou' 'baidu'
    if (type == 'music') {
        $('#list_' + type + ' ul').html('');
        $('#modal_music .checkbox_list').find('input[type=checkbox]:checked').each((i, d) => {
            site = d.value;
            if (site != 'all') {
                $.getJSON(api_url + '/api/search.php?server=' + site + '&type=search&name=' + name, function(json, textStatus) {
                    if (textStatus == 'success') {
                        html = '';
                        for (var detail of json) {
                            if (typeof(detail['artist']) == 'object') {
                                detail['artist'] = detail['artist'].join('&');
                                detail['pic'] = api_url + '/api/search.php?server=' + detail['source'] + '&type=cover&id=' + detail['pic_id'];
                            } else { // youtube
                                detail['album'] = ''; // 没有专辑信息
                            }
                            html += `<li class="list-group-item" data-type="music" data-source="` + detail['source'] + `" data-json='` + JSON.stringify(detail) + `'>
                        <div class="row">
                            <div class="col-3">
                                <img class="lazyload" src='` + detail['pic'] + `' width="100px" height="100px">
                                
                            </div>
                            <div class="col-9 text-left" style="line-height: 33px;">
                                ` + detail['name'] + `</br>
                                ` + detail['album'] + `</br>
                                ` + detail['artist'] + `</br>
                                ` + detail['source'] + `
                            </div>
                            
                        </div>
                        <div class="d-flex justify-content-end">
                                <svg xmlns="http://www.w3.org/2000/svg" data-action="play" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                                  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                </svg>
                                <button data-action="sendMedia" class="btn btn-primary">発信</button>
                            </div>
                      </li>`;
                        }
                        $('#list_' + type + ' ul').append(html).
                        find('.lazyload').lazyload({ effect: "fadeIn" });
                    }
                });
            }
        })
    } else
    if (type == 'video') {
        $.getJSON(api_url + '/api/video.php?server=youtube&type=search&name=' + name, function(json, textStatus) {
            if (textStatus == 'success') {
                html = '';
                for (var detail of json) {
                    html += `<li class="list-group-item" data-type="video" data-source="` + detail['source'] + `" data-json='` + JSON.stringify(detail) + `'>
                        <div class="row">
                            <div class="col-3">
                                <img class="lazyload" src='` + detail['pic'] + `' width="100px" height="100px">
                                
                            </div>
                            <div class="col-9 text-left" style="line-height: 33px;">
                                ` + detail['name'] + `</br>
                                ` + detail['artist'] + `
                            </div>
                            
                        </div>
                        <div class="d-flex justify-content-end">
                                <button data-action="sendMedia" class="btn btn-primary">発信</button>
                            </div>
                      </li>`;
                }
                $('#list_' + type + ' ul').html(html).
                find('.lazyload').lazyload({ effect: "fadeIn" });
            }
        });
    }
}

function setPlaying(url) {
    $('.progress-bar').css('width', '0%')
    _audio.src = url;
    _audio.autoplay = true;
    console.log('playUrl', url);
}

var g_lrcs = [];

function searchLyric(url) {
    g_lrcs = [];
    $.getJSON(url, function(json, textStatus) {
        if (textStatus == 'success') {
            var lrc, tlrc, time, detail;
            if (json.lyric) lrc = json.lyric.split("\n");
            if (json.tlyric) tlrc = json.tlyric.split("\n");
            for (var i in lrc) {
                time = getText(lrc[i], '[', ']');
                detail = {
                    time: getTime(time),
                    lrc: lrc[i].replace('[' + time + ']', ''),
                    tlrc: undefined,
                };
                if (detail.lrc) { // 去除空文本
                    if (tlrc) {
                        for (var t of tlrc) {
                            if (t.indexOf('[' + time + ']') == 0) {
                                detail.tlrc = t.replace('[' + time + ']', '');
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


function getTime(t) { // 00:00.460
    var a = t.split(':');
    return parseInt(a[0]) * 60 + a[1] * 1;
}

function getText(text, s, e) {
    var i_s = text.indexOf(s);
    if (i_s != -1) {
        i_s++;
        var i_e = text.indexOf(e, i_s);
        if (i_e != -1) {
            return text.substr(i_s, i_e - i_s);
        }
    }
    return '';
}