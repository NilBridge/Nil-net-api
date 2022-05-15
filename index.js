const path = require('path');
const express = require("express");
const logger = new NIL.Logger('nil-net-api');
const { segment } = require("oicq")
const StatusCode = require('./lib/statusCode');

const app = express();

var bodyParser = require('body-parser');
const uuid = require('./lib/uuid');

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// 解析 application/json
app.use(jsonParser);
// 解析 application/x-www-form-urlencoded
app.use(urlencodedParser);

let config_path = path.join(__dirname, 'config.json');

if (NIL.IO.exists(config_path) == false) {
    NIL.IO.WriteTo(config_path, JSON.stringify({
        port: 5888,
        enableVerify: true,
        verifyKey: "114514"
    }, null, 5));
}

let config = JSON.parse(NIL.IO.readFrom(config_path));

const Url2Func = new Map();
const SessionKeys = new Map();

function verify(req, res) {
    let body = req.body;
    try{
        let data = JSON.parse(body);
        if(config.enableVerify){
            if(data.verifyKey == config.verifyKey){
            }else{
                res.json({code:StatusCode.KeyWrong,msg:'verifyKey 不正确！'});
                return;
            }
        }
        if(NIL.bots.getBot(data.qq) == undefined){
            res.json({code:StatusCode.BotNotFound,msg:'bot未找到'});
            return;
        }
        let id  = uuid();
        SessionKeys.set(id,data.qq);
        res.json({
            code:StatusCode.OK,
            sessionKey:id
        });
    }catch(err){
        res.json({
            code:StatusCode.UnknowError,
            msg:err
        });
    }
}

function parseSendable(post){
    let result = {success:false,data:[],msg:''};
    post.forEach(item=>{
        switch(item.type){
            case 'text':
                result.data.push(item.raw);
                break;
            case 'image':
                let img = segment.image();
                switch(item.image_type){
                    case 'url':
                        img.url = item.url;
                        result.data.push(img);
                        break;
                    case 'file':
                        img.file = item.file;
                        result.data.push(img);
                        break;
                    default:
                        result.msg = `使用了未定义的图片模式：${item.image_type}`;
                        return result;
                }
                break;
            case 'at':
                let at = segment.at();
                if(item.qq == undefined){
                    result.msg = 'at时需要指定qq项';
                    return result;
                }
                at.qq = item.qq;
                result.data.push(item);
                break;
            case 'face':
                let face = segment.face();
            case 'face':
                if(item.id == undefined){
                    result.msg = '发送face时需要指定id项';
                    return result;
                }
                face.id = item.id;
                result.data.push(face);
                break;
        }
    });
    result.success = true;
    return result;
}

function sendGroupMessage(req,res){
    let body = req.body;
    try{
        let data = JSON.parse(body);
        if(data.sessionKey == undefined){
            res.json({
                code:StatusCode.ArgumentNotFound,
                msg:'缺少 sessionKey'
            });
            return;
        }
        let bot = NIL.bots.getBot(data.qq);
        if(bot == undefined){
            res.json({code:StatusCode.BotNotFound,msg:'bot未找到'});
            return;
        }
        let sendObj = parseSendable(data.messageChain);
        if(sendObj.success){
            bot.sendGroupMsg(data.target,sendObj.data);
        }else{
            res.json({
                code:StatusCode.ArgumentNotFound,
                msg:sendObj.msg
            })
        }
    }catch(err){
        res.json({
            code:StatusCode.UnknowError,
            msg:err
        });
    }
}

app.post('verify',verify);
app.post('sendGroupMessage',sendGroupMessage);
const server = app.listen(config.port);

class nil_net_api extends NIL.ModuleBase {
    can_be_reload = false;
    onStop(){
        server.close();
    }
}

module.exports = new nil_net_api;