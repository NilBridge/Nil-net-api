const path = require('path');
const express = require("express");

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

let config_path = path.join(__dirname,'config.json');
let config = JSON.parse(NIL.IO.readFrom(config_path));

app.post('/auth',(req,res)=>{

});

app.post('/sendGroupMessage',(req,res)=>{
    
});

function init(){

}

class nil_net_api extends NIL.ModuleBase{
    can_be_reload = false;
}

module.exports = new nil_net_api;