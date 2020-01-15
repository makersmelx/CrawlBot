const fs = require('fs');
var co = require('co')
var botError = require('./error')
var exp = require('./abstarctExp')
const TeleBot = require('telebot');

const group_id = process.env.INTERNAL_GHOST_GROUP_ID;
var botKey = process.env.TELEBOT_KEY;

const bot = process.env.HOME_PC ==1 ?
    new TeleBot({
        token: botKey,
        polling: {
            proxy:'socks5://127.0.0.1:1080'
        }
    }):
    new TeleBot({
        token: botKey,
    });


const sendSticker = (msg) => {
    let decision = Math.floor(Math.random()*stickeridCache.length);
    return msg.reply.sticker(stickeridCache[decision].id);
}

var restaurantList = './database/restaurants.json';
var sentenceList = './database/sentence.json';
var stickeridFile = './database/stickerid.json'
var goodReplyFile = './database/goodReply.json'

var configFile = './config.json';


//save json
const saveJSON = (filename, restaurantCache) =>{
    let data = JSON.stringify(restaurantCache,null,4);
    fs.writeFile(filename,data,(err) =>{
        if(err){
            botError.errorHandle('JSON write');
        }
    });
}
//eat count
const minus = (restaurantCache) =>{
    for(var i in restaurantCache){
        if(restaurantCache[i].times > 0){
            restaurantCache[i].times--;
        }
    }
    saveJSON(restaurantList,restaurantCache);
}

const checkAcess = (msg)=>{
    if(msg.chat.id != process.env.INTERNAL_GHOST_GROUP_ID){
        msg.reply.text(`Error: 不允许私聊改变${exp.random_ye()}的美丽`);
        return false;
    }
    else{
        return true;
    }
}

//json caches
var globalConfig = require(configFile);
var restaurantCache = require(restaurantList);
var sentenceCache = require(sentenceList);
var stickeridCache = require(stickeridFile);
var goodReplyCache = require(goodReplyFile);

//record the most speaking man
var lastTalk = globalConfig.lastTalk;

//daily reminder
const dailyReminder = require('./reminder')
if(dailyReminder.reminder(bot,group_id) == -1){
    minus(restaurantCache);
}

bot.on('/start',msg => {
    if(!globalConfig.mode){
        globalConfig.mode = 1;
        return msg.reply.text(`${ exp.random_ye() }醒了`);
    }
    else if (globalConfig.mode == 1){
        return msg.reply.text("cnm，干什么");
    }
    else if(globalConfig.mode == 2){
        globalConfig.mode = 1;
        return msg.reply.text(`歇了，${ exp.random_ye() }正常聊天`);
    }
    
});

bot.on('/end',msg => {
    if(globalConfig.mode){
        globalConfig.mode = 0;
        return msg.reply.text(`${ exp.random_ye() }睡了`);
    }
    else{
        return msg.reply.text("zzz");
    }
    
});

bot.on('/wxhmode',msg =>{
    if(!globalConfig.mode){
        return msg.reply.text(`${ exp.random_ye() }累了，不许嘴臭`);
    }
    else if(globalConfig.mode == 1){
        globalConfig.mode = 2;
        return msg.reply.text("Final mouth chou mode on. Tonight お母さん必死");
    }
});

// self-defined commands
bot.on('/eatwaht', msg => {
    if(globalConfig.mode){
        while(true){
            let decision = Math.floor(Math.random()*restaurantCache.length);
            if(restaurantCache[decision].times > 1){
                continue;
            }else{
                restaurantCache[decision].times ++;
                return msg.reply.text(`这顿吃${ restaurantCache[decision].name },不许🇫🇷`);
            }
        }   
    }
});

bot.on(/^\/addplace(@Jianghbot)?.*$/,msg => {
    if(globalConfig.mode){
        let rawData = msg.text;
        let splitData = rawData.split(" ",2);
        let newPlace =  splitData[1];
        if(!restaurantCache.find(function(value,index,arr){
            return value.name == newPlace;
        }))
        {
            if (newPlace == "") {
                return msg.reply.text(`?`);
            }
            restaurantCache.push({"name":newPlace,"times":"0"});
            saveJSON(restaurantList,restaurantCache);
            return msg.reply.text(`${ newPlace }, 这个新地方${ exp.random_ye() }记住了`);
        }
        else{
            return msg.reply.text("有这地了");
        }
    }
})


bot.on('/eatplace',msg=>{
    if(globalConfig.mode){
        var str = '现在你群约饭地点有:\n';
        for(var i in restaurantCache){
            let tmpName = restaurantCache[i].name;
            let tmpTime = restaurantCache[i].times;
            str = str + tmpName + "，最近选择了" + tmpTime + "次\n";
        }
        str = str + `一共🇫🇷了x次`
    }
    return msg.reply.text(str);
})

bot.on(/^\/zhenghuo(@Jianghbot)?.*$/,msg => {
    if(globalConfig.mode){
        let rawData = msg.text;
        let splitData = rawData.split(" ",2);
        if(!sentenceCache.find(function(value,index,arr){
            return value.content == splitData[1];
        }))
        {
            if (splitData[1]) {
                sentenceCache.push({"content":splitData[1]});
                saveJSON(sentenceList,sentenceCache);
                return msg.reply.text(`整挺好, ${ exp.random_ye() }下回出来迫害`);
            }
            else {
                return msg.reply.text(`你发的什么鸡掰, 给${ exp.random_ye() }说人话`);
            }
           
        }
        else{
            return msg.reply.text(`妈的多老的东西了，你还让${ exp.random_ye() }学`);
        }
    }
})

bot.on('/sentence',msg => {
    if(globalConfig.mode){
        let x = Math.floor(Math.random() * sentenceCache.length);
        return msg.reply.text(sentenceCache[x].content);
    }
})

bot.on(/^\/setprob(@Jianghbot)?.*$/, msg => {
    if (globalConfig.mode) {
        if(!checkAcess(msg)){
            return;
        }
        let rawData = msg.text;
        let splitData = rawData.split(" ", 2);
        var numReg = /^[0-9]+.?[0-9]*/;
        if (!numReg.test(splitData[1])) {
            return msg.reply.text(`cnm输入不符合格式，给${exp.random_ye()}重来`);
        }
        globalConfig.probability = splitData[1];
        let displayContent = `今、${exp.random_ye()}の嘴臭probaility is ${splitData[1]}\n`
        if (splitData[1] > globalConfig.discontentProb * 1) {
            displayContent += `\nWarning: Too high probabilty. ${exp.random_ye()} may casue dissatisfaction.`
        }
        return msg.reply.text(displayContent);
        
    }
});

bot.on('/checkprob', msg => {
    let displayContent = `Current probability: ${globalConfig.probability}`;
    if (globalConfig.probability > globalConfig.discontentProb * 1) {
        displayContent += `\nお知らせ：現在、${exp.random_ye()}の活動確率か高いで、ご注意ください`
    }
    return msg.reply.text(displayContent);
});

bot.on('/hello', msg => {
    return exp.requestZanghua(msg);
});

bot.on('sticker', msg => {
    if (globalConfig.mode) {
        co(function *() {
            //var file = yield bot.getFile(msg.sticker.file_id);
            stickeridCache.push({"id":`${msg.sticker.file_id}`});
            saveJSON(stickeridFile,stickeridCache);
        })
        
        
        let probability = globalConfig.probability;
        let x = Math.floor(Math.random()*100);
        if(x < probability / 2 || globalConfig.mode == 2){
            if(Math.random() < 0.5){
                return msg.reply.text(`发你麻痹的图呢，爬`);
            }
            else{
                return sendSticker(msg);
            }
            
        }
    }
    
});

// text message and stickers handler
bot.on(/^[^/].*/, msg => {
    if (globalConfig.mode) {
        let text = msg.text;
        let probability = globalConfig.probability;
        let x = Math.floor(Math.random() * 100);
        if (globalConfig.mode != 2) {
            if (x > probability) {
                return null;
            }
        }
        else {
            
            if(!goodReplyCache.find(function(value,index,arr){
                return value.content == text;
            }))
            {
                goodReplyCache.push({ "content": text });
                saveJSON(goodReplyFile,goodReplyCache);
            }
            
        }
        
        var relpyFormat = [`${text}个几把`, `你慢慢${text}``${text}个屁`, `不许${text.slice(0, 4)}`, "你说你🐴呢？", "有一说一确实",`${text}`,`cnm`,`给${exp.random_ye()}整乐了`,`?`,`爬爬爬`,`NM$L`,`给${exp.random_ye()}少说两句又不会死`];
        var num = relpyFormat.length + globalConfig.nontextMethods * 1;
        var choice = Math.floor(num * Math.random());

        if (choice < relpyFormat.length) {
            return msg.reply.text(relpyFormat[choice]);
        }
        else {
            //remember to modify nontextMethods in config.json
            switch (choice - relpyFormat.length) {
                case 5:{
                    var specialReg = [/.*不许.*/, /(^.*)((\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]).*/];
                    var specialFormat = [`？不许${text}`, `您就是抽象带师？`];
                    for (var i = 0; i < specialReg.length;i++) {
                        if (text.match(specialReg[i])) {
                            return msg.reply.text(specialFormat[i]);
                        }
                    }
                }
                case 0:case4:
                    return exp.requestZanghua(msg);
                    break;
                case 1:case 2:case 3:
                    return sendSticker(msg);
                    break;
                   
                default:
                    break;
            }
        }
    }
});

bot.start();