var g_click = {
    start: 0,
    task: -1,
    holding: false,
    startRecord: 0,
    recordTimer: 0,
};

var mediaRecorder;

function startClicking(event) {
    console.log('start');
    g_click.start = getNow();
    g_click.task = window.setTimeout(function() {
        if (g_click.start > 0) {
            console.log('长按');
            g_click.holding = true;
            startRecord();
        }
        g_click.start = 0;
        g_click.task = -1;
        event.originalEvent.preventDefault(true);
        event.originalEvent.stopPropagation();
    }, 500);
}

function sendRecord(){
  var reader = new FileReader();
    reader.readAsDataURL(chunks[0]);
    reader.onloadend = function() {
        queryMsg('voice||' + g_config.user + '||' + reader.result);
    }
    $('#recorder_play_btn,#recorder_play_send,#recorder_cnt').hide();
}

function stopClicking(event) {
    console.log('stop');
    if (g_click.task != -1) {
        window.clearTimeout(g_click.task);
    }
    g_click.start = 0;
    if (g_click.holding) {
        console.log('长按弹起');
        stopRecord();
        event.originalEvent.preventDefault(true);
        event.originalEvent.stopPropagation();
    }
    g_click.holding = false;
}


function startRecord() {
  chunks = [];
  if(!_video || _video.fullScreen.isFullScreen() == undefined){
    $('#ftb').addClass('btn-danger').find('.bi-mic').hide();
    $('#ftb').find('.bi-mic-fill').show();
  }else{
    $('#recorder_btn').addClass('btn-primary');
    $('#recorder_cnt').show().find('span').html('0');

  }
    g_click.startRecord = getNow();
    mediaRecorder.start();
    console.log("录音中...");
    soundTip('./res/di.mp3');

    g_click.recordTimer = setInterval(() => {
      var s = getNow() - g_click.startRecord;
      if(!_video || _video.fullScreen.isFullScreen() == undefined){
        $('#ftb .badge').html(s);
      }else{
        $('#recorder_cnt span').html(s);
      }
    }, 1000);
}

function stopRecord() {
  clearInterval( g_click.recordTimer);
  if(!_video || _video.fullScreen.isFullScreen() == undefined){

    $('#ftb').removeClass('btn-danger').find('.bi-mic').show();
    $('#ftb').find('.bi-mic-fill').hide();
    $('#ftb .badge').html('');
  }else{
    $('#recorder_play_btn,#recorder_play_send').show();
    $('#recorder_btn').removeClass('btn-primary');
  }
    mediaRecorder.stop();
    console.log("录音结束");
}

function switchRecord(){
  if (mediaRecorder.state !== "recording") {
  startRecord();
}else{
  stopRecord();
}
}


if (navigator.mediaDevices.getUserMedia) {
    var chunks = [];
    const constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(
        stream => {
            console.log("授权成功！");

            mediaRecorder = new MediaRecorder(stream);

            window.onkeydown = (event) => {
                if (event.key == 'Delete') {
                    if (mediaRecorder.state !== "recording") {
                        startRecord();
                    }
                }
            };

            window.onkeyup = (event) => {
                if (event.key == 'Delete') {
                    if (mediaRecorder.state === "recording") {
                        stopRecord();

                    }
                } else
                if (event.key == 'Insert') {
                    document.querySelector("#record1").play();
                }
            };

            $('#ftb').on('touchstart', function(event) {
                    startClicking(event);
                })
                .on('touchend', function(event) {
                    stopClicking(event);
                }).mousedown(function(event) {
                    startClicking(event);
                }).mouseup(function(event) {
                    stopClicking(event);
                });

            mediaRecorder.ondataavailable = e => {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = e => {
                var blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });

                var audioURL = window.URL.createObjectURL(blob);
                document.querySelector("#record1").src = audioURL;
                if(!_video || _video.fullScreen.isFullScreen() == undefined){
                  x0p({
                      title: '録音確認',
                      html: true,
                      text: '<audio id="record" src="' + audioURL + '" controls autoplay></audio>',
                      animationType: 'slideDown',
                      icon: 'info',
                      maxWidth: '500px',
                      buttons: [{
                              type: 'cancel',
                              text: 'キャンセル',
                          },
                          {
                              type: 'info',
                              text: '送信',
                          }
                      ]
                  }).then(function(data) {
                      if (data.button == 'info') {
                          sendRecord();
                      }
                  });
                }else{
                  console.log('11');
                }
                
            };
        },
        () => {
            alert("授权失败！");
        }
    );
} else {
    alert("浏览器不支持 getUserMedia");
}