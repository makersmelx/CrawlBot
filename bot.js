require('dotenv').config();
const fs = require('fs');
const group_id = process.env.INTERNAL_GHOST_GROUP_ID;
var botKey = process.env.TELEBOT_KEY;
const TeleBot = require('telebot');
const bot = new TeleBot(botKey);
var rawList;
var mustCrawl;
var restaurantList = './database/restaurants.json'

//save json
const saveJSON = (filename, jsonData) =>{
    let data = JSON.stringify(jsonData,null,4);
    fs.writeFile(filename,data,(err) =>{
        if(err){
            bot.sendMessage(group_id,"爬啊吴小黑，JSON文件存储失败")
        }
    });
}
//eat count
const minus = (jsonData) =>{
    for(var i in jsonData){
        if(jsonData[i].times > 0){
            jsonData[i].times--;
        }
    }
    saveJSON(restaurantList,jsonData);
}

//emoji
var whit_slim_ye = '\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddb3'

// Boot up
var mode = 1;
bot.sendMessage(group_id,`${ whit_slim_ye }启动了，快点给${ whit_slim_ye }爬`);

var jsonData = require('./database/restaurants.json');
if(!jsonData){
    bot.sendMessage(group_id,"吃你🐎呢，餐馆都没有")
}

// mode swtich
bot.on('/start',msg => {
    if(!mode){
        mode = true;
        return bot.sendMessage(group_id,"爷醒了");
    }
    else if (mode == 1){
        return bot.sendMessage(group_id,"cnm，干什么");
    }
    else if(mode == 2){
        mode = 1;
        return bot.sendMessage(group_id,"歇了，爷正常聊天");
    }
});

bot.on('/end',msg => {
    if(mode){
        mode = 0;
        return bot.sendMessage(group_id,"爷睡了");
    }
    else{
        return bot.sendMessage(group_id,"zzz");
    }
    
});

bot.on('/wxhmode',msg =>{
    if(!mode){
        return bot.sendMessage(group_id,"爷累了，不许嘴臭");
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
        minus(jsonData);
    });
    schedule.scheduleJob('0 0 16 * * *',()=>{
        bot.sendMessage(group_id,"晚饭吃啥");
        minus(jsonData);
    });
    schedule.scheduleJob('0 0 19 * * *',()=>{
        bot.sendMessage(group_id,"ybyb");
        minus(jsonData);
    });
    schedule.scheduleJob('0 0 0 * * *',()=>{
        bot.sendMessage(group_id,"唉又过了一天");
        minus(jsonData);
    });
}
reminder();

// text message and stickers handler
bot.on(/^[^/].*/, msg => {
    if(mode){
        let text = msg.text;

        //嘴臭judge
        let probability = 10;
        let x = Math.floor(Math.random()*100);

        //config
        var special = 2;

        //data
        var specialFormat = [`？不许${ text }`,`您就是抽象带师？`];
        var relpyFormat = [`${ text }个几把`,`不许${ text }`];

        //parse
        var specialReg = [/.*不许.*/,/.*(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55].*/];

        //reply
        //bot.sendMessage(group_id,`Current mode is ${ mode }`);
        if((x < probability) || (mode == 2)){
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
    }
});

bot.on('sticker', msg => {
    //console.log(msg);
    // console.log(jsonData.find(function(value,index,arr){
    //     return value.name == "41212";
    // }))
    if(mode){
        let x = Math.floor(Math.random()*100);
        if(x < 20 || mode == 2){
            return bot.sendMessage(group_id, `发你麻痹的图呢，爬`);
        }
    }
    
});

// self-defined commands
bot.on('/eatwaht', msg => {
    if(mode){
        while(true){
            let decision = Math.floor(Math.random()*jsonData.length);
            if(jsonData[decision].times > 1){
                continue;
            }else{
                jsonData[decision].times ++;
                return bot.sendMessage(group_id, `这顿吃${ jsonData[decision].name },不许🇫🇷`);
            }
        }   
    }
});

bot.on(/\/addplace .*/,msg => {
    if(mode){
        let newPlace = msg.text.slice(10);
        if(!jsonData.find(function(value,index,arr){
            return value.name == newPlace;
        }))
        {
            jsonData.push({"name":newPlace,"times":"0"});
            //console.log(jsonData);
            saveJSON(restaurantList,jsonData);
            return bot.sendMessage(group_id,`${ newPlace }, 这个新地方\ud83d\udc74\ud83c\udffb记住了`);
        }
        else{
            return bot.sendMessage(group_id,"有这地了");
        }
    }
})

bot.on(/\/addplace@Jianghbot .*/,msg => {
    if(mode){
        let newPlace = msg.text.slice(10);
        if(!jsonData.find(function(value,index,arr){
            return value.name == newPlace;
        }))
        {
            jsonData.push({"name":newPlace,"times":"0"});
            //console.log(jsonData);
            saveJSON(restaurantList,jsonData);
            return bot.sendMessage(group_id,`${ newPlace }, 这个新地方\ud83d\udc74\ud83c\udffb记住了`);
        }
        else{
            return bot.sendMessage(group_id,"有这地了");
        }
    }
})


bot.on('/eatplace',msg=>{
    if(mode){
        var str = '现在你群约饭地点有:\n';
        for(var i in jsonData){
            let tmpName = jsonData[i].name;
            let tmpTime = jsonData[i].times;
            //console.log(i);
            str = str + tmpName + "，最近选择了" + tmpTime + "次\n";
        }
        str = str + `一共🇫🇷了x次`
    }
    return bot.sendMessage(group_id,str);
})

bot.on('/sentence', msg => {
    if(mode){
        return bot.sendMessage(group_id, `就是吴小黑去一点点打工不来龙宾楼自习，上班的时候摸鱼打三麻，做得奶茶乱加糖还不封口。`);
    }
});

bot.start();