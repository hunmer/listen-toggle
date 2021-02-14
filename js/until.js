// 2021年1月11日 20点29分
var a_get = getGETArray();
var g_s_audio_path = '.';
var g_s_api = 'https://neysummer-listen-write.glitch.me/api/';
var g_localKey = 'dictation_';
// 本地储存前缀
var g_config = local_readJson('config', {
    user: undefined,
    lastList: undefined,
});

var g_datas = {
    user: {
        maki: {
            name: 'まき',
            icon: './img/maki.jpg'
        },
        chisato: {
            name: 'ちさと',
            icon: './img/chisato.jpg'
        }
    }
}

function getGETArray() {
    var a_result = [], a_exp;
    var a_params = window.location.search.slice(1).split('&');
    for (var k in a_params) {
        a_exp = a_params[k].split('=');
        if (a_exp.length > 1) {
            a_result[a_exp[0]] = decodeURIComponent(a_exp[1]);
        }
    }
    return a_result;
}

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if(data == undefined) data = '[]';
        return localStorage.setItem(key, data);
    }
    return false;
}


function getTimeString(s){
    s = Number(s);
    var h = 0, m = 0, d = 0;
    if(s >= 86400){
        d = parseInt(s / 86400);
        s %= 86400;
    }    
    if(s >= 3600){
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if(s >= 60){
        m = parseInt(s / 60);
        s %= 60;
    }
    if(m <= 0) m = 1;
    return _s2(d, '日')+_s2(h, '时')+_s2(m, '分')+'前';
}


function local_readJson(key, defaul = '') {
    if(!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function getLocalItem(key, defaul = '') {
    var r = null;
    if(window.localStorage){
        r = localStorage.getItem(g_localKey + key);
    }
    return r === null ? defaul : r;
}

function setLocalItem(key, value) {
    if(window.localStorage){
       return localStorage.setItem(g_localKey + key, value);
    }
    return false;
}

function _s2(s, j = ''){
    s = parseInt(s);
    return (s == 0 ? '' : s + j) ;
}

function randNum(min, max){
    return parseInt(Math.random()*(max-min+1)+min,10);
}

function getNow(){
    return parseInt(new Date().getTime() / 1000);
}

var g_res = {
    svg_trash: `<svg data-action="deleteMsg" class="bi bi-trash2" width="1.2em" height="1.2em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M3.18 4l1.528 9.164a1 1 0 0 0 .986.836h4.612a1 1 0 0 0 .986-.836L12.82 4H3.18zm.541 9.329A2 2 0 0 0 5.694 15h4.612a2 2 0 0 0 1.973-1.671L14 3H2l1.721 10.329z"/>
  <path d="M14 3c0 1.105-2.686 2-6 2s-6-.895-6-2 2.686-2 6-2 6 .895 6 2z"/>
  <path fill-rule="evenodd" d="M12.9 3c-.18-.14-.497-.307-.974-.466C10.967 2.214 9.58 2 8 2s-2.968.215-3.926.534c-.477.16-.795.327-.975.466.18.14.498.307.975.466C5.032 3.786 6.42 4 8 4s2.967-.215 3.926-.534c.477-.16.795-.327.975-.466zM8 5c3.314 0 6-.895 6-2s-2.686-2-6-2-6 .895-6 2 2.686 2 6 2z"/>
</svg>`,
    svg_clipboard: `<svg data-action="copyMsg" class="bi bi-clipboard" width="1.2em" height="1.2em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
  <path fill-rule="evenodd" d="M9.5 1h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
</svg>`,
    svg_card: `<svg data-action="inputText" class="bi bi-card-text" width="1.2em" height="1.2em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M14.5 3h-13a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
  <path fill-rule="evenodd" d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
</svg>`,
    svg_comment: `<svg class="bi bi-chat-dots-fill" width="2em" height="3em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
</svg>`,
}

