var exp = require('./abstarctExp');
function initMode(bot,mode){
    bot.on('/start',msg => {
        if(!mode){
            mode = true;
            return msg.reply.text(`${ exp.random_ye() }醒了`);
        }
        else if (mode == 1){
            return msg.reply.text("cnm，干什么");
        }
        else if(mode == 2){
            mode = 1;
            return msg.reply.text(`歇了，${ exp.random_ye() }正常聊天`);
        }
    });
    
    bot.on('/end',msg => {
        if(mode){
            mode = 0;
            return msg.reply.text(`${ exp.random_ye() }睡了`);
        }
        else{
            return msg.reply.text("zzz");
        }
        
    });
    
    bot.on('/wxhmode',msg =>{
        if(!mode){
            return msg.reply.text(`${ exp.random_ye() }累了，不许嘴臭`);
        }
        else if(mode == 1){
            mode = 2;
            return msg.reply.text("Final mouth chou mode on. Tonight お母さん必死");
        }
    });
    return mode;
}

module.exports = {
    initMode
}