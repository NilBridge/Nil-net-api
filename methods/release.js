const StatusCode = require("../lib/statusCode");

const { SessionKeys } = require("./verify");


function release (req,res){
    let data = req.body;
    try {
        let has = SessionKeys.has(data.sessionKey);
        if(has){
            SessionKeys.delete(data.sessionKey);
            res.json({
                code:StatusCode.OK
            });
        }else{
            res.json({
                code:StatusCode.BotNotFound,
                msg:"没有这个SessionKey"
            });
        }
    } catch (err) {
        res.json({
            code: StatusCode.UnknowError,
            err
        });
    }
}

module.exports = release;