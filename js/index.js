// var socket_url = 'ws://192.168.1.3:8000';
// var api_url = '.';
var socket_url = 'wss://listen-toggle-websocket.glitch.me';
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
    if (!g_config.user) {
        $('#modal_user').modal('show');
    } else {
        hsycms.loading('読み込み中');
        setUser(g_config.user);
    }
});

function queryMsg(msg, debug = false) {
    connection.send(msg);
    if (debug) console.log(debug);
}

function recon() {
    hsycms.confirm('confirm', 'サーバー接続に失敗しました！ 再接続しましたか？',
        function(res) {
            window.location.reload();
            return;
            connection.close();
            connection = new WebSocket(socket_url)
            hsycms.loading('loading', '読み込み中');
        },
        function(res) {},
    );
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

function init() {
    if (g_b_inited) return;
    g_b_inited = true;
    _audio2 = $('#audio_tip')[0];

    connection = new WebSocket(socket_url);
    connection.onopen = () => {
        queryMsg('broadcast||login||' + g_config.user);
        hsycms.hideLoading();

        if (checkPlayerTimer) {
            clearInterval(checkPlayerTimer);
        }
        checkPlayerTimer = setInterval(() => {
            queryMsg('list');
        }, 5000);
        queryMsg('list');
        checkOnline();
        
        // queryMsg('sendMedia||maki||{"name":"グランドイリュージョン","ablum":"","artist":"","url":"https://s750.clipwatching.com/hls/zx5xsntp4f2txcne4y5clgp23jjjuem22527btq55cxxiku6qx6y2as3pgjq/index-v1-a1.m3u8","pic":"https://easy-movie.com/wp-content/uploads/2019/07/IMG_2581.jpg","type":"video"}');

        // queryMsg('sendMedia||maki||{"name":"僕たちの七日間戦争","ablum":"","artist":"","url":"https://youku.cdn7-okzy.com/20200325/18173_e01b3f41/1000k/hls/index.m3u8","pic":"https://img2.nysk.fj.cn/pic/tt27imgs/2020-3/1585121440.jpg","type":"video"}');
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
            case 'msg':
                dom_addMsg(params[1], params[2]);
                break;

            case 'danmu':
                var danmu = _video.addElement(JSON.parse(params[2]));
                var danmuS = _video.getElement(danmu);
                var obj = {
                    element: danmu,
                    parameter: 'x',
                    static: true, //是否禁止其它属性，true=是，即当x(y)(alpha)变化时，y(x)(x,y)在播放器尺寸变化时不允许变化
                    effect: 'None.easeOut',
                    start: null,
                    end: -danmuS['width'],
                    speed: 10,
                    overStop: true,
                    pauseStop: true,
                    callBack: 'deleteChild'
                };
                var danmuAnimate = _video.animate(obj);
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
    .on('focus', '#input_danmu', function(event) { // 输入弹幕时强制不隐藏控件栏
           $("#mse > div > div:nth-child(2)").addClass('_show');
           $("#mse > div > div:nth-child(3)").addClass('_show');
    })
    .on('blur', '#input_danmu', function(event) {
            $('._show').removeClass('_show');
    });
    $('.progress').click(function(event) {
        if (_audio.duration) _audio.currentTime = event.originalEvent.offsetX / $(this).width() * _audio.duration;
    });

      $(window).resize(function(event) {
        var w = $(this).width();
        var h = $(this).height();
        if(w > h){
            $('#container').addClass('width'); // 显示滚动条
            $('#view').addClass('width-view');

            if(h < 600){
               $('#inputArea').addClass('inputArea_top');
            }else{
                $('#inputArea').removeClass('inputArea_top');
            }
        }else{

             $('#inputArea').removeClass('inputArea_top');
            $('#container').removeClass('width').removeClass('_normal').css('height', '');
            $('#view').removeClass('width-view');

            if(h < 720){
                $('#danmu_bar, #icon_bar').hide();
            }else{
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


function loadedHandler(name) {
    //调用到该函数后说明播放器已加载成功，可以进行部分控制了。此时视频还没有加载完成，所以不能控制视频的播放，暂停，获取元数据等事件
    _video.addListener('error', () => {
        //queryMsg('status||' + g_config.user + '||faild||bg-danger');
    });
    _video.addListener('time', () => {
        var pro = _video.V.currentTime / _video.V.duration * 100;
        if (!isNaN(pro)) {
            queryMsg('status||' + g_config.user + '||' + pro + '||bg-info');

        }
    });
    _video.addListener('loadedmetadata', () => {
        queryMsg('status||' + g_config.user + '||ok||bg-success');
        /*if (g_playing.target) {
            console.log('调整到 ' + g_playing.target);
            _video.V.currentTime = g_playing.target * _video.V.duration;
            g_playing.target = undefined;
        }*/
    });
    _video.addListener('ended', () => {
        if (_video.V.duration > 0) {
            queryMsg('status||' + g_config.user + '||終了||bg-light');
        }
    });
     _video.addListener('full', (b) => {
        if(b){ // 全屏显示弹幕输入控件
            $('[data-title=点击播放]').parent().append($(`<input clas="mt-2" style="width: 300px;margin-top: 5px;margin-left:200px" type="text" id="input_danmu" placeholder="ご感想を" onkeydown="if(event.keyCode == 13 && !event.ctrlKey){sendDanmu(this.value);this.value = '';}">`));
        }else{
            $('#input_danmu').remove();
        }
    });
}

function loadVideo(url, poster = '') {
    if(!poster) poster = '.img/loading.gif';
    var config = {
        container: '#mse', //“#”代表容器的ID，“.”或“”代表容器的class
        variable: '_video', //播放函数名称，该属性必需设置，值等于下面的new ckplayer()的对象
        loaded: 'loadedHandler', //播放器加载完成后调用该函数
        volume: 1, //音量，范围：0-1
         mobileCkControls: true,
        html5m3u8: url.indexOf('.m3u8') != -1,
        poster: poster,
        video: url, //视频地址
    };
    if (!_video) {
        _video = new ckplayer(config);
    } else {
        _video.newVideo(config);
    }
}

function shareLink() {
    var url = $('#input_link').val();
    var id = cutString(url + '&', 'v=', '&');
    var cover = $('#input_cover').val();
    var name = $('#input_name').val();
    if (cover == '') {
        cover = id ? 'https://i.ytimg.com/an_webp/' + id + '/mqdefault_6s.webp' : './img/cover.webp';
    }
    var data = {
        name: name ? name : url,
        ablum: $('#input_album').val(),
        artist: $('#input_artist').val(),
        url: ($('#share_select')[0].selectedIndex == 0 ? 'https://alltubedownload.net/download?url=' : '') + url,
        pic: cover,
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

        case 'fitler_site':
            var site = dom.val();
            var selected = dom.prop('checked');
            console.log(site, selected);
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
            hsycms.tips('tips', '音量 : ' + _audio.volume * 100);
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
            console.log(pro);
            if (pro > 0) {
                pro += 0.0005; //偏差
                var json = JSON.parse(g_listPlayer[user]);
                if (JSON.stringify(json) != JSON.stringify(g_playing.data)) { //不是同一首歌
                    parseMusic(json);
                    g_playing.target = pro;
                } else {
                    if (g_playing.data.type == 'video') {
                        _video.V.currentTime = pro * _video.V.duration;
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

function sendDanmu(msg) {
    var danmuObj = {
        list: [{
            type: 'image', //定义元素类型：只有二种类型，image=使用图片，text=文本
            file: $('.navbar-brand img').attr('src'), //图片地址
            radius: 30, //图片圆角弧度
            width: 30, //定义图片宽，必需要定义
            height: 30, //定义图片高，必需要定义
            alpha: 0.9, //图片透明度(0-1)
            marginLeft: 10, //图片离左边的距离
            marginRight: 10, //图片离右边的距离
            marginTop: 10, //图片离上边的距离
            marginBottom: 10, //图片离下边的距离
            clickEvent: ""
        }, {
            type: 'text', //说明是文本
            text: msg, //文本内容
            color: '0xFFDD00', //文本颜色
            size: 14, //文本字体大小，单位：px
            font: '"Microsoft YaHei", YaHei, "微软雅黑", SimHei,"\5FAE\8F6F\96C5\9ED1", "黑体",Arial', //文本字体
            leading: 30, //文字行距
            alpha: 1, //文本透明度(0-1)
            paddingLeft: 10, //文本内左边距离
            paddingRight: 10, //文本内右边距离
            paddingTop: 0, //文本内上边的距离
            paddingBottom: 0, //文本内下边的距离
            marginLeft: 0, //文本离左边的距离
            marginRight: 10, //文本离右边的距离
            marginTop: 10, //文本离上边的距离
            marginBottom: 0, //文本离下边的距离
            backgroundColor: '0xFF0000', //文本的背景颜色
            backAlpha: 0.5, //文本的背景透明度(0-1)
            backRadius: 30, //文本的背景圆角弧度
            clickEvent: "actionScript->videoPlay"
        }],
        x: '100%', //x轴坐标
        y: 20, //y轴坐标
        //position:[2,1,0],//位置[x轴对齐方式（0=左，1=中，2=右），y轴对齐方式（0=上，1=中，2=下），x轴偏移量（不填写或null则自动判断，第一个值为0=紧贴左边，1=中间对齐，2=贴合右边），y轴偏移量（不填写或null则自动判断，0=紧贴上方，1=中间对齐，2=紧贴下方）]
        alpha: 1,
        //backgroundColor:'#FFFFFF',
        backAlpha: 0.8,
        backRadius: 30 //背景圆角弧度
    }
    queryMsg('danmu||' + g_config.user + '||' + JSON.stringify(danmuObj));
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
        if (_video) _video.V.src = '';
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

        loadVideo(json['url'] ? json['url'] : api_url + '/api/video.php?server=' + json['source'] + '&type=url&id=' + json['id'], json['pic']);
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
            <div class="card mb-2" style="width: 18rem;margin: 0 auto;" data-json='`+data+`'>
              <img src='` + detail['pic'] + `' height="300px" class="card-img-top" alt="...">
              <div class="card-body">
                 <div style="width: 100%;margin: 0 auto;display: inline-grid">
                    <img class="user_icon" src="`+g_datas.user[userName].icon +`" style="margin: 0 auto;">
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
            <div class="card mb-2" style="width: 18rem;margin: 0 auto;" data-json='`+data+`'>
              <img src='` + detail['pic'] + `' height="300px" class="card-img-top" alt="...">
              <div class="card-body">
                 <div style="width: 100%;margin: 0 auto;display: inline-grid">
                    <img class="user_icon" src="`+g_datas.user[userName].icon +`" style="margin: 0 auto;">
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
    if(h > $(window).height() - 60 && con.hasClass('width')){
       con.addClass('_normal'); // 显示滚动条
    }else{
        if(con.hasClass('width')){
            con.removeClass('_normal').height(h); // 扩大高度
        }
    }
    soundTip('./res/pop.mp3');
}


function confirm(text, params = {
    ok: function() {},
    cancel: function() {},
    ok_text: 'done',
    cancel_text: 'cancel'
}) {
    hsycms.confirm('confirm', text,
        function(res) {
            params.ok();
            hsycms.success('success', params.ok_text);
        },
        function(res) {
            console.log(params);
            params.cancel();
            hsycms.error('error', params.cancel_text);
        },
    )
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
        hsycms.success('success', '暗号正解！');
        setFormTip(dom, true, '暗号正解！');
        setTimeout(function() {
            $('#modal_user').modal('hide');
        })
    } else {
        hsycms.error('error', '暗号無効！');
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
            console.log(json);
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