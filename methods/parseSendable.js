const { segment } = require("oicq")
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

module.exports = parseSendable;