var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var http = require('http');
var mysql = require('mysql');
var TelegramBot = require('node-telegram-bot-api');

var token = '264518223:AAGeLZ5-gVfH6ZgILNFrvFlEyZtpk_dzLx0';

var werewolfGroupId = 0;
var werewolfGroupName = "";
var werewolfPlayersId = [];
var werewolfPlayersName = [];
var werewolfRoles = [];
var werewolfIsAlive = [];
var werewolfHasAction = [];
var werewolfKilled = [];
var werewolfText = [];
var werewolfVoted = [];
var port = 8080;
console.log("Port is "+port);
var host = "0.0.0.0";
function generatebuttons(textarray,callbackdataarray,chatId){
  var firstopts = {}
  firstopts.resize_keyboard = true;
  firstopts.one_time_keyboard = true;
  firstopts.inline_keyboard = []
  for (var i =0;i < textarray.length;i++){
      var arrayer = [];
      arrayer.push({text: textarray[i],callback_data: callbackdataarray[i]+":"+chatId});
      firstopts.inline_keyboard.push(arrayer);
  }   
  var secondopts = JSON.stringify(firstopts);
  var thirdopts = { reply_markup: secondopts }
  return thirdopts;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var forcereplyopts = {
  reply_markup: JSON.stringify(
    {
      force_reply: true
    }
  )};
  
var inlineopts = {
  reply_markup: JSON.stringify(
    {
      keyboard: [["Nep"]] ,
      resize_keyboard: true ,
      one_time_keyboard: true
    }
  )};
console.log("Starting NepgearBot");
var bot = new TelegramBot(token, {polling: true});

var con = mysql.createConnection({
  host: process.env.NEPGEARSQL_PORT_3306_TCP_ADDR,
  user: "nepgear",
  password: "a9b8c7d6",
  database : "nepgear"
});

con.query("SELECT * FROM information_schema.tables WHERE table_schema = 'nepgear' AND table_name = 'waifu'",function(err,rows){
if(err) throw err;
console.log(rows.length);
if (rows.length == 0 ){
con.query('CREATE TABLE waifu (user_id int(64) NOT NULL, waifu varchar(128), PRIMARY KEY (user_id) )',function(err,rows){if(err) throw err;console.log("Create table");});
}
});

var app = express();
app.use(bodyParser.json());

app.post('/nepgears', function (req, res) {
  console.log("WEBHOOK: \n"+req.body);
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', function(request, response) {
  console.log("Get request on port");
  response.sendStatus(200);
});

var server = http.createServer( app)
server.listen(port, function () {
  console.log("Express server listening on port "+port);
});

bot.setWebHook('https://nepgearbot-nepgearbot.44fs.preview.openshiftapps.com:443/nepgears',__dirname+'/crt.pem');
var starttext = "Ini adalah NepgearBot, bot milik Ryo Kenrie Wongso (Damillora). Berjalan di OpenShift dan Node.js";
var helptext = "NepgearBot: bot punya Ryo. Lapor semua bug ke Ryo.";
console.log("Started NepgearBot");

// Matches /nep
bot.onText(/\/nep/, function (msg) {
  console.log("/nep");
  var fromId = msg.chat.id;
  var nep = "Nep"
  
  /*var firstopts = {}
  firstopts.resize_keyboard = true;
  firstopts.one_time_keyboard = true;
  var myStringArray = ["Nep","NepNep"]
  firstopts.keyboard = []
  for (var i =0;i < myStringArray.length;i++){
      var arrayer = [];
      arrayer.push(myStringArray[i]);
      firstopts.keyboard.push(arrayer);
  }*/
  /*var firstopts =     {
      keyboard: [["Nep"]] ,
      resize_keyboard: true ,
      one_time_keyboard: true
    }
  var secondopts = JSON.stringify(firstopts);
  var thirdopts = { reply_markup: secondopts }*/
  var thirdopts = generatebuttons(["Nep","NepNep"],["nep","nepnep"],fromId);
  console.log(thirdopts);
  bot.sendMessage(fromId, nep, thirdopts).then(function (sended) {
    var chatId = sended.chat.id;
    var messageId = sended.message_id;
    bot.onReplyToMessage(chatId, messageId, function (message) {
      bot.sendMessage(message.chat.id,"Nep!");
    });
  });
});
bot.on("callback_query",function(msg){
    var user = msg.from.id;
    var data = msg.data;
    var array = data.split(":");
    var command = array[0]
    var chatId = array[1]
    console.log(msg.from.first_name+":"+data);
    if(command == "nep"){
        bot.sendMessage(chatId,"Nep!");
    }else if(command == "nepnep"){
        bot.sendMessage(chatId,"Nep!Nep!");
        
    }else if(command.split(",")[0] == "kill"){
        if (werewolfHasAction[werewolfPlayersId.indexOf(command.split(",")[1])] == "yes") {
            bot.sendMessage(chatId,"Udah kenyang, woi!");
        }else{
            bot.sendMessage(chatId,"Anda telah memutuskan untuk memakan "+werewolfPlayersName[werewolfPlayersId.indexOf(command.split(",")[1])]);
        werewolfKilled.push(command.split(",")[1]);
        werewolfHasAction[werewolfPlayersId.indexOf(command.split(",")[1])] = "yes";
        werewolfText.push(werewolfPlayersName[werewolfPlayersId.indexOf(command.split(",")[1])]+" ditemukan telah hilang telinga kirinya! Ada sesuatu yang aneh. "+werewolfPlayersName[werewolfPlayersId.indexOf(command.split(",")[1])]+" adalah seorang "+werewolfRoles[werewolfPlayersId.indexOf(command.split(",")[1])]);
        }
        
    }else if(command.split(",")[0] == "vote"){
        if (werewolfHasAction[werewolfPlayersId.indexOf(command.split(",")[1])] == "yes") {
            bot.sendMessage(chatId,"Udah milih, woi!");
        }else{
            bot.sendMessage(werewolfGroupId,werewolfPlayersName[werewolfPlayersId.indexOf(chatId)]+" telah memutuskan untuk mengeksekusi "+werewolfPlayersName[werewolfPlayersId.indexOf(command.split(",")[1])]);
        werewolfVoted.push(command.split(",")[1]);
        }
    }
    bot.answerCallbackQuery(msg.id,"",false);
});
bot.onText(/\/setwaifu/, function (msg) {
  console.log("/setwaifu");
  if (msg.chat.type == "private" ) {
  var fromId = msg.chat.id;
  var waifuId = msg.from.id;
  var nep = "Ketik nama waifu-mu :v"
  bot.sendMessage(waifuId, nep,forcereplyopts).then(function (sended) {
    var chatId = sended.chat.id;
    var messageId = sended.message_id;
    bot.onReplyToMessage(chatId, messageId, function (message) {
      var waifu = message.text
      console.log(waifuId);
      con.query("SELECT * FROM waifu WHERE user_id = "+waifuId,function(err,rows){
      if(err) throw err;
      console.log(rows.length);
      if (rows.length == 0 ){
        con.query("INSERT INTO waifu (user_id, waifu) VALUES ( ? , ? )",[waifuId,waifu],function(err,rows){if(err) throw err;console.log("Insert");});
      }else{
        con.query("UPDATE waifu SET waifu = ? WHERE user_id = ?",[waifu,waifuId],function(err,rows){if(err) throw err;console.log("Update");});
      }
        
      });
      bot.sendMessage(message.chat.id,"Waifu berhasil diset!");
    });
  });
  }
  else
  {
     bot.sendMessage(msg.chat.id,"Perintah hanya dapat digunakan dalam personal chat dengan bot.");
  }
});

bot.onText(/\/waifu/, function (msg) {
  console.log("/waifu");
  var fromId = msg.chat.id;
  var waifuId = msg.from.id;
      console.log(waifuId);
      con.query("SELECT * FROM waifu WHERE user_id = "+waifuId,function(err,rows){
      if(err) throw err;
      console.log(rows);
      if (rows.length == 0 ){
          bot.sendMessage(fromId,"Orang ini belum punya waifu :v");
      }else{
          bot.sendMessage(fromId,"Waifu dari "+msg.from.first_name+" adalah "+rows[0].waifu);
      }
        
      });
});

bot.onText(/\/lapar/, function (msg) {
  console.log("/lapar");
  var fromId = msg.chat.id;
  var nep = "Traktirin dong!"
  bot.sendMessage(fromId, nep);
});

bot.onText(/\/anjas/, function (msg, match) {
  console.log("/anjas");
  var fromId = msg.chat.id;
  var userFirst = msg.from.first_name;
  bot.sendMessage(fromId, userFirst + ": Anjas.");
});

bot.onText(/\/astaga/, function (msg, match) {
  console.log("/astaga");
  var fromId = msg.chat.id;
  var userFirst = msg.from.first_name;
  bot.sendMessage(fromId, userFirst + ": Astaganaga!");
});

bot.onText(/\/ngakak/, function (msg, match) {
  console.log("/ngakak");
  var fromId = msg.chat.id;
  var userFirst = msg.from.first_name;
  bot.sendMessage(fromId, userFirst + ": hahahahawkwkwkwk");
});


bot.onText(/\/hore/, function (msg, match) {
  console.log("/hore");
  var fromId = msg.chat.id;
  var userFirst = msg.from.first_name;
  bot.sendMessage(fromId, userFirst + ": Hore!");
});

bot.onText(/\/ayo/, function (msg, match) {
  console.log("/ayo");
  var fromId = msg.chat.id;
  var userFirst = msg.from.first_name;
  bot.sendMessage(fromId, userFirst + ": Ayo!");
});

bot.onText(/\/lemot/, function (msg, match) {
  console.log("/lemot");
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, "Botnya lemot, ih.");
});

bot.onText(/\/jualan/, function (msg, match) {
  console.log("/jualan");
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, "Akua akua, mijon mijon");
});

bot.onText(/\/start/, function (msg) {
  console.log("/start");
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, starttext);
});


bot.onText(/\/help/, function (msg) {
  console.log("/start");
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, helptext);
});



 bot.onText(/\/joinwerewolf/, function (msg) {
  console.log("/joinwerewolf");
  console.log(msg.chat.type);
  join(msg);
});


function cleanwerewolf(){
werewolfGroupId = 0;
werewolfGroupName = "";
werewolfPlayersId = [];
werewolfPlayersName = [];
werewolfRoles = [];
werewolfIsAlive = [];
werewolfHasAction = [];
werewolfKilled = [];
werewolfText = [];
werewolfVoted = [];
    
}

function day(){
    for (var i = 0; i < werewolfText.length;i++){
        bot.sendMessage(werewolfGroupId,werewolfText[i]);
    }
    var action = []
    for (var i = 0; i < werewolfPlayersName.length;i++){
        action.push("no");
    }
    werewolfHasAction = action;
    bot.sendMessage(werewolfGroupId,"Pagi hari. Semua orang terbangun. Ada berita terbaru?");
    for (var i = 0; i < werewolfText.length;i++){
        bot.sendMessage(werewolfGroupId,werewolfText[i]);
    }
    checkstatus();
    werewolfText = [];
    bot.sendMessage(werewolfGroupId,"Para warga desa mempunyai waktu 120 detik untuk berdiskusi / pura-pura ilang sinyal / mengaku menjadi warga desa");
    setTimeout(function(){bot.sendMessage(werewolfGroupId,"Para warga memiliki waktu 120 detik untuk voting.");},120000);
    setTimeout(executor,121000);
    setTimeout(executing,241000);
    setTimeout(night,242000);
}

function killing(){
    for(var i = 0;i<werewolfKilled.length;i++){
        werewolfIsAlive[werewolfPlayersId.indexOf(werewolfKilled[i])] = "no";
    }
}
function executor(){
for (var i = 0; i < werewolfPlayersName.length;i++){
        if(werewolfIsAlive[i] == "yes"){
                var textarr = [];
                var callbackarr = [];
                for (var j = 0;j < werewolfPlayersName.length;j++){
                    if (werewolfPlayersId[i] == werewolfPlayersId[j]) {
                        
                    }else{
                    textarr.push(werewolfPlayersName[j]);
                    callbackarr.push("vote,"+werewolfPlayersId[j]);
                    }
                }
                var thirdopts = generatebuttons(textarr,callbackarr,werewolfPlayersId[i]);
                bot.sendMessage(werewolfPlayersId[i],"Siapa yang menurut Anda bersalah, dan patut untuk dieksekusi?",thirdopts);
        }
    }  
}
function mode(arr) {
    var numMapping = {};
    var greatestFreq = 0;
    var mode;
    arr.forEach(function findMode(number) {
        numMapping[number] = (numMapping[number] || 0) + 1;

        if (greatestFreq < numMapping[number]) {
            greatestFreq = numMapping[number];
            mode = number;
        }
    });
    return +mode;
}

function executing(){
    var executed = mode(werewolfVoted);
    werewolfText.push("Warga menyetujui untuk mengeksekusi "+werewolfPlayersName[werewolfPlayersId.indexOf(executed)]+". "+werewolfPlayersName[werewolfPlayersId.indexOf(executed)]+" adalah seorang "+werewolfRoles[werewolfPlayersId.indexOf(executed)]);
    werewolfIsAlive[werewolfPlayersId.indexOf(executed)] == "no";
}
function werewolfaction(){
    for (var i = 0; i < werewolfPlayersName.length;i++){
        if(werewolfIsAlive[i] == "yes"){
            if(werewolfRoles[i] == "werewolf"){
                var textarr = [];
                var callbackarr = [];
                for (var j = 0;j < werewolfPlayersName.length;j++){
                    if (werewolfPlayersId[i] == werewolfPlayersId[j]) {
                        
                    }else{
                    textarr.push(werewolfPlayersName[j]);
                    callbackarr.push("kill,"+werewolfPlayersId[j]);
                    }
                }
                var thirdopts = generatebuttons(textarr,callbackarr,werewolfPlayersId[i]);
                bot.sendMessage(werewolfPlayersId[i],"Anda bisa memakan seseorang sekarang. Pilih siapa yang akan Anda makan.",thirdopts);
                
  
            }else if(werewolfRoles[i] == "villager"){
                
            }
        }
    }
}
function night(){
    bot.sendMessage(werewolfGroupId, "Malam hari. Kebanyakan orang mulai tidur, namun ada aja yang bangun, berkeliaran dan menjalankan aksinya. Pemain malam hari, kalian punya waktu 120 detik untuk menjalankan aksi.");
        setTimeout(werewolfaction,1000);
        setTimeout(killing,120000);
        setTimeout(day,121000);
}
function checkstatus(){
    console.log(werewolfGroupId);
console.log(werewolfGroupName);
console.log(werewolfPlayersId);
console.log(werewolfPlayersName);
console.log(werewolfRoles);
console.log(werewolfIsAlive);
console.log(werewolfHasAction);
console.log(werewolfKilled);
console.log(werewolfText);
    var werewolfcount =0;
    var villagercount =0;
    for (var i = 0; i < werewolfPlayersName.length ;i++){
        
        console.log(werewolfIsAlive[i]);
        console.log(werewolfRoles[i]);
        if(werewolfIsAlive[i] == "yes"){
            if(werewolfRoles[i] == "werewolf"){
                werewolfcount = werewolfcount + 1;
            }else if(werewolfRoles[i] == "villager"){
                villagercount = villagercount +1 ;
            }
        }
    }
    console.log(werewolfcount);
    console.log(villagercount);
    if (villagercount == 0){
        if (werewolfcount > 0){
            bot.sendMessage(werewolfGroupId,"Serigala menang!");
            cleanwerewolf();
        }
    }else{
        
        
    }
    
}
function startwerewolf(){
    console.log("Startwerewolf");
    if(werewolfPlayersName.length < 5){
        bot.sendMessage(werewolfGroupId,"Yah. Pemain tidak cukup. Werewolf@NepgearBot membutuhkan setidaknya 5 pemain!");
        cleanwerewolf();
        return;
    }
    var unrandom = []
    var alive = []
    var action = []
    for (var i = 0; i < werewolfPlayersName.length - 1;i++){
        unrandom.push("villager");
        alive.push("yes");
        action.push("no");
    }
    unrandom.push("werewolf");
        alive.push("yes");
        action.push("no");
    var random = shuffle(unrandom);
    werewolfRoles = random;
    werewolfIsAlive = alive;
    werewolfHasAction = action;
    for (var i = 0; i < werewolfPlayersName.length ;i++){
        console.log(werewolfPlayersName[i]+" is "+werewolfRoles[i]);
    }
    bot.sendMessage(werewolfGroupId,"Permainan Werewolf@NepgearBot sudah dimulai!");
    checkstatus();
    night();
}
function join(msg){
  var fromId = msg.chat.id;
  var userFirst = msg.from.first_name;
  var userLast = msg.from.last_name || "";
  if (msg.chat.type == "group"){
    if(werewolfGroupId == fromId){
     if(werewolfPlayersId.indexOf(msg.from.id)== -1){
          werewolfPlayersId.push(msg.from.id);
      werewolfPlayersName.push(userFirst+" "+userLast);
      bot.sendMessage(fromId, userFirst+" "+userLast+" telah bergabung dalam permainan Werewolf@NepgearBot");
     }else{
       bot.sendMessage(fromId,"Kamu sudah join! Tunggu permainannya dimulai, ya!");   
     }
    }else{
      bot.sendMessage(fromId, "Anda bukan dalam grup yang ditetapkan untuk permainan Werewolf@NepgearBot");
    }
  }else{
     bot.sendMessage(fromId, "Perintah ini hanya dapat digunakan dalam grup.");
  }
}

 bot.onText(/\/createwerewolf/, function (msg) {
       console.log("/createwerewolf");
  console.log(msg.chat.type);
  var fromId = msg.chat.id;
  var userFirst = msg.from.first_name;
  var userLast = msg.from.last_name || "";
  if (msg.chat.type == "group"){
      if (werewolfGroupId == 0){
          werewolfGroupId = msg.chat.id;
          werewolfGroupName = msg.chat.title;
          bot.sendMessage(fromId, userFirst+" "+userLast+" telah menetapkan room "+msg.chat.title+" untuk Werewolf@NepgearBot");  
          bot.sendMessage(fromId, "Permainan akan dimulai dalam 3 menit");
          setTimeout(startwerewolf, 180000);
          setTimeout(function(){bot.sendMessage(fromId,"Werewolf@NepgearBot akan dimulai dalam 2 menit. Cepat join!");},60000);
          setTimeout(function(){bot.sendMessage(fromId,"Werewolf@NepgearBot akan dimulai dalam 1 menit. Cepat join!");},120000);
          setTimeout(function(){bot.sendMessage(fromId,"Werewolf@NepgearBot akan dimulai dalam 30 detik. Cepat join!");},150000);
          setTimeout(function(){bot.sendMessage(fromId,"Werewolf@NepgearBot akan dimulai dalam 10 detik. Cepat join!");},170000);
          join(msg);
      }else{
          bot.sendMessage(fromId,"Grup "+werewolfGroupName+" telah menggunakan room untuk Werewolf@NepgearBot");        
      }
  }else{
     bot.sendMessage(fromId, "Perintah ini hanya dapat digunakan dalam grup.");
  } 
});
 
