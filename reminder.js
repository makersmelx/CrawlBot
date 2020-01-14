const schedule = require('node-schedule');
function reminder(bot,group_id){
    schedule.scheduleJob('0 0 10 * * *',()=>{
        bot.sendMessage(group_id,"午饭吃啥");
        return -1;
    });
    schedule.scheduleJob('0 0 16 * * *',()=>{
        bot.sendMessage(group_id,"晚饭吃啥");
        return -1;
    });
    schedule.scheduleJob('0 0 19 * * *',()=>{
        bot.sendMessage(group_id,"ybyb");
        return 0;
    });
    schedule.scheduleJob('0 0 0 * * *',()=>{
        bot.sendMessage(group_id,"唉又过了一天");
        return 0;
    });
}
module.exports={
    reminder
}