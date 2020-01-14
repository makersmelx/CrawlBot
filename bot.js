require('dotenv').config();
const fs = require('fs');
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

//嘴臭api
var normal = process.env.KOU_TU_LIAN_HUA;
var fire = process.env.HUO_LI_QUAN_KAI;

const requestZanghua = () => {
    var request = require('request');
    if (Math.random() < 0.3) {
        request(fire, function (err, response, content) {
            if (err) {
                console.log("Failure.");
            }
            else {
                return bot.sendMessage(group_id, content);
            }
        })
    }  
    else {
        request(normal, function (err, response, content) {
            if (err) {
                console.log("Failure.");
            }
            else {
                return bot.sendMessage(group_id, content);
            }
        })
    }
}

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
            bot.sendMessage(group_id,"爬啊吴小黑，JSON文件存储失败")
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


//emoji
const random_ye = ()=>{
    var ye_emoji = ['\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddb3','\ud83d\udc74\ud83c\udffb','\ud83d\udc74','\ud83d\udc74\ud83c\udffc','\ud83d\udc74\ud83c\udffd','\ud83d\udc74\ud83c\udffe','\ud83d\udc74\ud83c\udfff'];
    let x = Math.floor(Math.random()*ye_emoji.length);
    return ye_emoji[x];
}

//record the most speaking man
var lastTalk = { "id": "0", times: "0" };

// Boot up
var mode = 1;
bot.sendMessage(group_id,`${ random_ye() }启动了，快点给${ random_ye() }爬`);

//json caches
var configCache = require(configFile);
if(!configCache){
    bot.sendMessage(group_id,`No configuration file found. ${ random_ye() }歇了`)
}

var restaurantCache = require('./database/restaurants.json');
if(!restaurantCache){
    bot.sendMessage(group_id,"吃你🐎呢，餐馆都没有")
}

var sentenceCache = require('./database/sentence.json');
if(!sentenceCache){
    bot.sendMessage(group_id,`${ random_ye() }语录呢？`)
}

var picUrlCache = require(picUrlFile);
if (!picUrlCache) {
    bot.sendMessage(group_id,`没表情包, ${ random_ye() }歇了`)
}

// mode swtich
bot.on('/start',msg => {
    if(!mode){
        mode = true;
        return bot.sendMessage(group_id,`${ random_ye() }醒了`);
    }
    else if (mode == 1){
        return bot.sendMessage(group_id,"cnm，干什么");
    }
    else if(mode == 2){
        mode = 1;
        return bot.sendMessage(group_id,`歇了，${ random_ye() }正常聊天`);
    }
});

bot.on('/end',msg => {
    if(mode){
        mode = 0;
        return bot.sendMessage(group_id,`${ random_ye() }睡了`);
    }
    else{
        return bot.sendMessage(group_id,"zzz");
    }
    
});

bot.on('/wxhmode',msg =>{
    if(!mode){
        return bot.sendMessage(group_id,`${ random_ye() }累了，不许嘴臭`);
    }
    else if(mode == 1){
        mode = 2;
        return bot.sendMessage(group_id,"Final mouth chou mode on. Tonight お母さん必死");
    }
});

//schedule work
const schedule = require('node-schedule');
const reminder = ()=>{
    schedule.scheduleJob('0 0 10 * * *',()=>{
        bot.sendMessage(group_id,"午饭吃啥");
        minus(restaurantCache);
    });
    schedule.scheduleJob('0 0 16 * * *',()=>{
        bot.sendMessage(group_id,"晚饭吃啥");
        minus(restaurantCache);
    });
    schedule.scheduleJob('0 0 19 * * *',()=>{
        bot.sendMessage(group_id,"ybyb");
        minus(restaurantCache);
    });
    schedule.scheduleJob('0 0 0 * * *',()=>{
        bot.sendMessage(group_id,"唉又过了一天");
        minus(restaurantCache);
    });
}
reminder();

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
            return bot.sendMessage(group_id, `给${random_ye()}少说两句又不会死`);
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
                return requestZanghua();
            }

            let choices = 2;
            let final = Math.floor(Math.random()*choices);
            //let special = 0;
            for(var i = 0; i < special;i ++){
                if(text.match(specialReg[i])){
                    return bot.sendMessage(group_id,specialFormat[i]);
                }
            }
        
            if(final == 0){
                let text = msg.text.slice(0,3);
                //return bot.sendMessage(group_id, `${ text }个几把`);
                return bot.sendMessage(group_id, relpyFormat[final]);
            }
            else if(final == 1){
                return bot.sendMessage(group_id, `不许${ text }`);
            }
            
        }
        //repeat
        else if (x < 2 * probability) {
            return bot.sendMessage(group_id, msg.text);
        }
        else if (x < 3 * probability) {
            return bot.sendMessage(group_id, `有一说一，确实`);
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
                return bot.sendMessage(group_id, `这顿吃${ restaurantCache[decision].name },不许🇫🇷`);
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
            return bot.sendMessage(group_id,`${ newPlace }, 这个新地方${ random_ye() }记住了`);
        }
        else{
            return bot.sendMessage(group_id,"有这地了");
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
    return bot.sendMessage(group_id,str);
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
                return bot.sendMessage(group_id,`整挺好, ${ random_ye() }下回出来迫害`);
            }
            else {
                return bot.sendMessage(group_id,`你发的什么鸡掰, 给${ random_ye() }说人话`);
            }
           
        }
        else{
            return bot.sendMessage(group_id,`妈的多老的东西了，你还让${ random_ye() }学`);
        }
    }
})

bot.on('/sentence',msg => {
    if(mode){
        let x = Math.floor(Math.random() * sentenceCache.length);
        return bot.sendMessage(group_id,sentenceCache[x].content);
    }
})

bot.on(/^\/setprob(@Jianghbot)?.*$/,msg => {
    if (mode) {
        let rawData = msg.text;
        let splitData = rawData.split(" ", 2);
        var numReg = /^[0-9]+.?[0-9]*/;
        if (!numReg.test(splitData[1])) {
            return bot.sendMessage(group_id,`cnm输入不符合格式，给${ random_ye() }重来`);
        }
        configCache.probability = splitData[1];
        let displayContent = `今、${random_ye()}の嘴臭probaility is ${splitData[1]}\n`
        if (splitData[1] > 10) {
            displayContent += `\nWarning: Too high probabilty. ${random_ye()} may casue dissatisfaction.`
        }
        return bot.sendMessage(group_id,displayContent);
        
    }
})

bot.on('/checkprob', msg => {
    let displayContent = `Current probability: ${configCache.probability}.\n实际互动强度为: ${4 * configCache.probability}\n`;
    if (configCache.probability > 10) {
        displayContent += `\nお知らせ：現在、${random_ye()}の活動確率か高いで、ご注意ください`
    }
    return bot.sendMessage(group_id, displayContent);
})

bot.on('/hello', msg => {
    return requestZanghua();
})

bot.start();