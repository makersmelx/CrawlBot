const fs = require('fs');
var botError = require('./error')
var exp = require('./abstarctExp')

const group_id = process.env.INTERNAL_GHOST_GROUP_ID;
var botKey = process.env.TELEBOT_KEY;
const TeleBot = require('telebot');
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


const sendPic = (msg) => {
    let decision = Math.floor(Math.random()*picUrlCache.length);
    return msg.reply.photo(picUrlCache[decision].url);
}

var restaurantList = './database/restaurants.json';
var sentenceList = './database/sentence.json';
var configFile = './config.json';
var picUrlFile = './database/picUrl.json'

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

//record the most speaking man
var lastTalk = { "id": "0", times: "0" };

// Boot up
var mode = 1;
bot.sendMessage(group_id,`${ exp.random_ye() }启动了，快点给${ exp.random_ye() }爬`);

//json caches
var configCache = require(configFile);
if(!configCache){
    bot.sendMessage(group_id,`No configuration file found. ${ exp.random_ye() }歇了`)
}

var restaurantCache = require('./database/restaurants.json');
if(!restaurantCache){
    bot.sendMessage(group_id,"吃你🐎呢，餐馆都没有")
}

var sentenceCache = require('./database/sentence.json');
if(!sentenceCache){
    bot.sendMessage(group_id,`${ exp.random_ye() }语录呢？`)
}

var picUrlCache = require(picUrlFile);
if (!picUrlCache) {
    bot.sendMessage(group_id,`没表情包, ${ exp.random_ye() }歇了`)
}

// mode swtich
var modeSwitch = require('./mode');
mode = modeSwitch.initMode(bot,mode);

//daily reminder
const dailyReminder = require('./reminder')
if(dailyReminder.reminder(bot,group_id) == -1){
    minus(restaurantCache);
}

// text message and stickers handler
bot.on(/^[^/].*/, msg => {
    var tmp;
    if (mode) {
        //刷屏
        if (lastTalk.id == 0) {
            lastTalk.id = msg.from.id;
        }
        else if(msg.from.id != lastTalk.id)
        {
            lastTalk.id = 0;
            lastTalk.times = 0;
        }
        lastTalk.times++;
    
        if (lastTalk.times >= 3) {
            lastTalk.times = 0;
            return msg.reply.text(`给${exp.random_ye()}少说两句又不会死`);
        }

        tmp = lastTalk.times;
        lastTalk.times = 0;

        let text = msg.text;
        //嘴臭judge
        let probability = configCache.probability;
        let x = Math.floor(Math.random()*100);

        //config
        var special = 2;

        //data
        var specialFormat = [`？不许${ text }`,`您就是抽象带师？`];
        var relpyFormat = [`${ text }个几把`,`不许${ text }`];

        //parse
        var specialReg = [/.*不许.*/, /(^.*)((\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]).*/];
    
        //reply
        if ((x < probability) || (mode == 2)) {
            if (Math.random() < 0.4) {
                return exp.requestZanghua(msg);
            }

            let choices = 2;
            let final = Math.floor(Math.random()*choices);
            //let special = 0;
            for(var i = 0; i < special;i ++){
                if(text.match(specialReg[i])){
                    return msg.reply.text(specialFormat[i]);
                }
            }
        
            if(final == 0){
                let text = msg.text.slice(0,3);
                //return bot.sendMessage(group_id, `${ text }个几把`);
                return msg.reply.text(relpyFormat[final]);
            }
            else if(final == 1){
                return msg.reply.text(`不许${ text }`);
            }
            
        }
        //repeat
        else if (x < 2 * probability) {
            return msg.reply.text(msg.text);
        }
        else if (x < 3 * probability) {
            return msg.reply.text(`有一说一，确实`);
        }
        else if (x < 4 * probability) {
            return sendPic(msg);
        }
        
    }
    lastTalk.times = tmp;
    return null;
});

bot.on('sticker', msg => {
    if (mode) {
        let probability = configCache.probability;
        let x = Math.floor(Math.random()*100);
        if(x < probability || mode == 2){
            return bot.sendMessage(group_id, `发你麻痹的图呢，爬`);
        }
    }
    
});

// self-defined commands
bot.on('/eatwaht', msg => {
    if(mode){
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
    if(mode){
        let rawData = msg.text;
        let splitData = rawData.split(" ",2);
        console.log(splitData);
        let newPlace =  splitData[1];
        if(!restaurantCache.find(function(value,index,arr){
            return value.name == newPlace;
        }))
        {
            restaurantCache.push({"name":newPlace,"times":"0"});
            //console.log(restaurantCache);
            saveJSON(restaurantList,restaurantCache);
            return msg.reply.text(`${ newPlace }, 这个新地方${ exp.random_ye() }记住了`);
        }
        else{
            return msg.reply.text("有这地了");
        }
    }
})


bot.on('/eatplace',msg=>{
    if(mode){
        var str = '现在你群约饭地点有:\n';
        for(var i in restaurantCache){
            let tmpName = restaurantCache[i].name;
            let tmpTime = restaurantCache[i].times;
            //console.log(i);
            str = str + tmpName + "，最近选择了" + tmpTime + "次\n";
        }
        str = str + `一共🇫🇷了x次`
    }
    return msg.reply.text(str);
})

bot.on(/^\/zhenghuo(@Jianghbot)?.*$/,msg => {
    if(mode){
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
    if(mode){
        let x = Math.floor(Math.random() * sentenceCache.length);
        return msg.reply.text(sentenceCache[x].content);
    }
})

bot.on(/^\/setprob(@Jianghbot)?.*$/,msg => {
    if (mode) {
        let rawData = msg.text;
        let splitData = rawData.split(" ", 2);
        var numReg = /^[0-9]+.?[0-9]*/;
        if (!numReg.test(splitData[1])) {
            return msg.reply.text(`cnm输入不符合格式，给${ exp.random_ye() }重来`);
        }
        configCache.probability = splitData[1];
        let displayContent = `今、${exp.random_ye()}の嘴臭probaility is ${splitData[1]}\n`
        if (splitData[1] > 10) {
            displayContent += `\nWarning: Too high probabilty. ${exp.random_ye()} may casue dissatisfaction.`
        }
        return msg.reply.text(displayContent);
        
    }
})

bot.on('/checkprob', msg => {
    let displayContent = `Current probability: ${configCache.probability}.\n实际互动强度为: ${4 * configCache.probability}\n`;
    if (configCache.probability > 10) {
        displayContent += `\nお知らせ：現在、${exp.random_ye()}の活動確率か高いで、ご注意ください`
    }
    return msg.reply.text(displayContent);
})

bot.on('/hello', msg => {
    return exp.requestZanghua(msg);
})

bot.start();