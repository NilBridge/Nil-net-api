const { GuildApp, Guild, Channel } = require('oicq-guild');
const parseSendable = require("./parseSendable");
const { SessionKeys } = require("./verify");
const StatusCode = require('../lib/statusCode');
const Guilds = new Map();

function getGuild(qq, gid) {
    if (Guilds.has(qq) == false) {
        let app = GuildApp.bind(NIL.bots.getBot(qq));
        Guilds.set(qq, app);
    }
    return new Guild(Guilds.get(qq), gid)
}
function getChannel(guild, chid) {
    return new Channel(guild, chid)
}

function sendGuildMessage(req, res) {
    let data = req.body;
    let guild_id = data.guild_id;
    let ch_id = data.channel_id;
    try {
        let bot = SessionKeys.get(data.sessionKey);
        let sendObj = parseSendable(data.messageChain);
        let ch_obj = getChannel(getGuild(bot, guild_id), ch_id);
        if (sendObj.success) {
            ch_obj.sendMessage(sendObj.data).then(mrt => {
                res.json({
                    code: StatusCode.OK
                })
            }).catch(re => {
                res.json({
                    code: StatusCode.UnknowError,
                    err: re
                })
            })
        } else {
            res.json({
                code: StatusCode.ArgumentNotFound,
                msg: sendObj.msg
            })
        }

    } catch (err) {
        res.json({
            code: StatusCode.UnknowError,
            err
        })
    }
}

module.exports = {
    Guilds,
    sendGuildMessage
}