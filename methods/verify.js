const SessionKeys = new Map();
const StatusCode = require('../lib/statusCode');
const config = require('../config.json');
const uuid = require('../lib/uuid');
function verify(req, res) {
    let data = req.body;
    try {
        if (data.verifyKey == config.verifyKey) {
        } else {
            res.json({ code: StatusCode.KeyWrong, msg: 'verifyKey 不正确！' });
            return;
        }
        if (NIL.bots.getBot(data.qq) == undefined) {
            res.json({ code: StatusCode.BotNotFound, msg: 'bot未找到' });
            return;
        }
        let id = uuid();
        SessionKeys.set(id, data.qq);
        res.json({
            code: StatusCode.OK,
            sessionKey: id
        });
    } catch (err) {
        res.json({
            code: StatusCode.UnknowError,
            msg: err
        });
    }
}


module.exports = {
    verify,
    SessionKeys
}