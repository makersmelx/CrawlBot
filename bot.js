const TeleBot = require('telebot');
const bot = new TeleBot('1050071598:AAGwP-WG8ceF7mHzREEYFKj4KIE62901Tdw');
const group_id = '-369930843';
var rawList;
var mustCrawl;
var mode = 0;
// On every text message
var fs = require("fs");
fs.readFile('restaurants',function(err,data){
    if(err){
        bot.sendMessage(group_id,`吃屁呢，餐厅列表加载不出来`);
        
    }
    else{
        rawList =data.toString();
    }
});

fs.readFile('mustCrawl',function(err,data){
    if(err){
        bot.sendMessage(group_id,`就是吴小黑搞坏了爷，爷都不知道谁该爬了`);
        
    }
    else{
        mustCrawl =data.toString();
    }
});

bot.on('/start',msg => {
    if(!mode){
        mode = false;
        return bot.sendMessage(group_id,"爷醒了");
    }
    else{
        return bot.sendMessage(group_id,"cnm，干什么");
    }
});

bot.on('/end',msg => {
    if(mode){
        mode = false;
        return bot.sendMessage(group_id,"爷睡了");
    }
    else{
        return bot.sendMessage(group_id,"zzz");
    }
    
});

bot.on(/^[^/]./, msg => {
    if(mode){
        let id = msg.from.id;
        let text = msg.text.slice(0,3);
        let x = Math.floor(Math.random()*100);
        if(x < 20 || mode == 2){
            return bot.sendMessage(group_id, `${ text }个几把`);
        }
    }
    
});

bot.on('sticker', msg => {
    if(mode){
        let x = Math.floor(Math.random()*100);
        if(x < 20 || mode == 2){
            return bot.sendMessage(group_id, `发你麻痹的图呢，爬`);
        }
    }
    
});

bot.on('/eatwaht', msg => {
    if(mode){
        return bot.sendMessage(group_id, `吃你🐎`);
    }
});

bot.start();