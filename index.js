const path = require('path');
const express = require("express");
const logger = new NIL.Logger('nil-net-api');

const app = express();

var bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// 解析 application/json
app.use(jsonParser);
// 解析 application/x-www-form-urlencoded
app.use(urlencodedParser);

const verify = require('./methods/verify').verify;
const session = require('./methods/sessionKey');
const sendGroupMessage = require('./methods/sendGroupMessage');
const {sendGuildMessage} = require('./methods/sendGuildMessage');
const release = require('./methods/release');
let config_path = path.join(__dirname, 'config.json');

if (NIL.IO.exists(config_path) == false) {
    NIL.IO.WriteTo(config_path, JSON.stringify({
        port: 5888,
        verifyKey: "114514"
    }, null, 5));
}

let config = JSON.parse(NIL.IO.readFrom(config_path));

app.post('/verify',verify);
app.post('/sendGroupMessage',session,sendGroupMessage);
app.post('/sendGuildMessage',session,sendGuildMessage);
app.post('/release',session,release);

const server = app.listen(config.port);

class nil_net_api extends NIL.ModuleBase {
    can_reload_require = false;
    can_be_reload = false;
	onStart(api){
		api.logger.info('app listen:',config.port);
	}
    onStop(){
        server.close();
    }
}

module.exports = new nil_net_api;