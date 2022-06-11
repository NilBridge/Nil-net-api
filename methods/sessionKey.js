const StatusCode = require('../lib/statusCode');
const { SessionKeys } = require('./verify');


module.exports = (req,res,next)=>{
    let data  =req.body;
    if(data.sessionKey){
        if(SessionKeys.has(data.sessionKey)){
            next();
        }else{
            res.json({
                code:StatusCode.KeyWrong,
                msg:"sessionKey 不正确"
            });
        }
    }else{
        res.json({
            code:StatusCode.ArgumentNotFound,
            msg:"无法找到 sessionKey"
        });
    }
}
