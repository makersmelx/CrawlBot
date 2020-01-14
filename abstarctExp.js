var botError = require('./error')
require('dotenv').config();

function random_ye(){
    var ye_emoji = ['\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddb3','\ud83d\udc74\ud83c\udffb','\ud83d\udc74','\ud83d\udc74\ud83c\udffc','\ud83d\udc74\ud83c\udffd','\ud83d\udc74\ud83c\udffe','\ud83d\udc74\ud83c\udfff'];
    let x = Math.floor(Math.random()*ye_emoji.length);
    return ye_emoji[x];
}

//嘴臭api

const requestZanghua = (msg) => {
    var request = require('request');
    var normal = process.env.KOU_TU_LIAN_HUA;
    var fire = process.env.HUO_LI_QUAN_KAI;

    var url = Math.random() < 0.3? fire:normal;
    request(url, function (err, response, content) {
        if (err) {
            botError.errorHandle('API');
        }
        else {
            return msg.reply.text(content);
        }
    })
}
module.exports = {
    random_ye,
    requestZanghua
}