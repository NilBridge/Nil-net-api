var WebSocketServer = require('websocket').server;
const http = require('http');
const path = require('path');
const fs = require('fs');
const dir = path.join(__dirname, 'net-api');
var allsockets = [];
try {
    fs.statSync(dir + "/config.json");
} catch {
    fs.mkdirSync(dir);
    fs.writeFileSync(dir + "/config.json", JSON.stringify({ enable: true, port: 8123, key: "114514", version: "1.0.0" }, null, '\t'));
}

const cfg = JSON.parse(fs.readFileSync(dir + "/config.json", 'utf8'))

if (cfg.enable == false) return;

function log(msg) {
    NIL.Logger.info('net-api', msg);
}

var messages = {};

var server = http.createServer((req, res)=> {
    log('Received request for ' + req.url);
    var re = {code:-1};
    switch (req.method) {
        case "GET":
            switch(req.url.split('?')[0]){
                case "/getGroupList":
                    eq = NIL.bot.getGroupList();
                    re.list = [];
                    eq.forEach(g=>{
                        re.list.push(g);
                    })
                    break;
                case "/getFriendList":
                    eq = NIL.bot.getFriendList();
                    re.list = [];
                    eq.forEach(g=>{
                        re.list.push(g);
                    })
                    break;
                case "/getMessages":
                    re.messages = messages;
                    break;
                case "/getMessageById":
                    try{
                        ul = parseURL(req.url);
                        if(ul.id==undefined){
                            re = {
                                code : 400,
                                msg : "cannot find property “id”"
                            };
                            break;
                        }
                        if(messages[ul.id] == undefined){
                            re.code = 404;
                            break;
                        }
                        re.message = messages[ul.id];
                    }catch(err){
                        re = {code:400,msg:err.toString()}
                    }
                    break;
                case "/clearMessages":
                    messages = {};
                    break;
            }
            break;
        case "POST":
            let postData = '';
            req.on('data', chunk => {
                postData += chunk;
            })
            req.on('end', () => {
                var dt = JSON.parse(postData);
                switch(req.url){
                    case "/sendGroupMessage":
                        NIL.bot.sendGroupMessage(dt.target,dt.text);
                        break;
                    case "/sendFriendMessage":
                        NIL.bot.sendFriendMessage(dt.target,dt.text);
                        break;
                }           
            });
            break;
    }
    res.writeHead(200,{  'Content-Type':'application/json;charset=utf-8'});
    if(re.code == -1) re.code=200;
    res.end(JSON.stringify(re));
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

wsServer.on('request', function (request) {
    var connection = request.accept();//'echo-protocol', request.origin);
    allsockets.push(connection);
    log('collect with ' + connection.remoteAddress);
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            try {
                on_pack(message.utf8Data);
            } catch (err) {
                NIL.Logger.warn('net-api', err);
            }

        }
    });
    connection.on('close', function (reasonCode, description) {
        allsockets.remove(connection);
        log('collection lost with : ' + connection.remoteAddress + `(code:${reasonCode})`);
    });
});

function parseURL(url){
    var ul = url.split('?');
    if(ul.lenght == 1){
        throw new Error('not a right url:'+url);
    }
    var querys = ul[1].split("&");
    var rt = {};
    querys.forEach(s=>{
        var e = s.split("=");
        rt[e[0]] = e[1];
    })
    return rt;
}

function on_pack(dt) {
    var pack = JSON.parse(dt);
    switch (pack.type) {
        case "sendGroupMessage":
            NIL.bot.sendGroupMessage(pack.params.target, pack.params.text);
            break;
        case "sendFriendMessage":
            NIL.bot.sendFriendMessage(pack.params.target, pack.params.text);
            break;
        default:
            NIL.Logger.warn('net-api', `接收到未定义的数据包：${pack.type}`);
            break;
    }
}

function net_on_group(e) {
    var id = e.message_id;
    var p = {
        messageChain: e.message,
        id,
        sender: {
            id: e.sender.user_id,
            name: e.sender.nickname,
            xboxid: (NIL.XDB.wl_exsis(e.sender.user_id)) ? NIL.XDB.get_xboxid(e.sender.user_id) : null
        },
        group: {
            id: e.group_id,
            name: e.group_name
        }
    };
    var ps = JSON.stringify(p);
    messages[id]=p;
    allsockets.forEach(socket => {
        socket.sendUTF(ps);
    });
}

NIL.FUNC.PLUGINS.GROUP.push(net_on_group);



log('init!');
log('version 1.0.5');

function onStart(){
    server.listen(cfg.port, '0.0.0.0', () => {
        log('API listening on ' + cfg.port);
    });
}

function onStop(){
    server.close();
    log('HTTP服务器已关闭');
}

module.exports = {
    onStart,
    onStop
};

/*
{
    "post_type": "message",
    "message_id": "MDTy4LBlZSUAACcF84zy0GGQmCwB",
    "user_id": 2959435045,
    "time": 1636866092,
    "seq": 9989,
    "rand": 4086100688,
    "font": "微软雅黑",
    "message": [
        { "type": "text", "text": "测试" }
    ],
    "raw_message": "测试",
    "message_type": "group",
    "sender": {
        "user_id": 2959435045,
        "nickname": "DreamLition",
        "card": "DreamLition",
        "sex": "male",
        "age": 17,
        "area": "",
        "level": 1,
        "role": "admin",
        "title": ""
    },
    "group_id": 808776416,
    "group_name": "NilBridge | 公测++",
    "block": false,
    "sub_type": "normal",
    "anonymous": null,
    "atme": false,
    "atall": false,
    "group": {},
    "member": {},
    "self_id": 2837945976
}
*/