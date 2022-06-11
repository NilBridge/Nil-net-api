const StatusCode = require("../lib/statusCode");
const parseSendable = require("./parseSendable");
const { SessionKeys } = require("./verify");

function sendGroupMessage(req,res){
    let data = req.body;
    try{
        let bot = NIL.bots.getBot(SessionKeys.get(data.sessionKey));
        if(bot == undefined){
            res.json({code:StatusCode.BotNotFound,msg:'bot未找到'});
        }else{
            let sendObj = parseSendable(data.messageChain);
            if(sendObj.success){
                bot.sendGroupMsg(data.target,sendObj.data).then(mrt=>{
                    res.json({
                        code:StatusCode.OK,
                        id:mrt.message_id
                    })
                }).catch(re=>{
                    res.json({
                        code:StatusCode.UnknowError,
                        err:re
                    })
                })
            }else{
                res.json({
                    code:StatusCode.ArgumentNotFound,
                    msg:sendObj.msg
                })
            }
        }
    }catch(err){
		console.log(err);
        res.json({
            code:StatusCode.UnknowError,
            msg:err
        });
    }
}

module.exports = sendGroupMessage;