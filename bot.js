const TeleBot = require('telebot');
const bot = new TeleBot('1050071598:AAGwP-WG8ceF7mHzREEYFKj4KIE62901Tdw');
const group_id = '-369930843';
// On every text message
var eat_place = require("fs");

bot.on('text', msg => {
    let id = msg.from.id;
    let text = msg.text.slice(0,3);
    let x = Math.floor(Math.random()*100);
    if(x < 20){
        return bot.sendMessage(group_id, `${ text }个几把`);
    }
    
});

bot.on('sticker', msg => {
    let x = Math.floor(Math.random()*100);
    if(x < 20){
        return bot.sendMessage(group_id, `发你麻痹的图呢，爬`);
    }
});

bot.on('/eatwaht', msg => {
    return bot.sendMessage(group_id, `吃你🐎`);
});

bot.start();