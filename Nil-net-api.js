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
    fs.writeFileSync(dir + "/config.json", JSON.stringify({ enable: true, port: 8123, key: "114514",version:"1.0.0" }, null, '\t'));
}

const cfg = JSON.parse(fs.readFileSync(dir + "/config.json", 'utf8'))

if (cfg.enable == false) return;

function log(msg) {
    NIL.Logger.info('net-api', msg);
}

var server = http.createServer(function (request, response) {
    log('Received request for ' + request.url);
    var re = {};
    switch (request.url) {
        case "/sendGroupMessage":
            re = { code: 200 };
            break;
        case "/senFriendMessage":
            re = { code: 200 };
            break;
        default:
            re = { code: 404 };
            break;
    }
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    response.write(JSON.stringify(re));
    response.end();
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
    var p = {
        messageChain : e.message,
        sender :{
            id:e.sender.user_id,
            name : e.sender.nickname,
            xboxid : (NIL.XDB.wl_exsis(e.sender.user_id))?NIL.XDB.get_xboxid(e.sender.user_id):null
        },
        group:{
            id:e.group_id,
            name: e.group_name
        }
    }
    allsockets.forEach(socket => {
       socket.sendUTF(JSON.stringify(p));
    });
}

NIL.FUNC.PLUGINS.GROUP.push(net_on_group);

server.listen(cfg.port, '0.0.0.0',()=>{
    log('API listening on '+cfg.port);
});

log('init!');
log('version 1.0.0');
