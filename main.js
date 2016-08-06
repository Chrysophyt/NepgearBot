var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var http = require('http');
var mysql = require('mysql');
var google = require('google');
google.resultsPerPage = 10;
var TelegramBot = require('node-telegram-bot-api');

var token = '264518223:AAGeLZ5-gVfH6ZgILNFrvFlEyZtpk_dzLx0';


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
var starttext = "Terima kasih karena sudah menggunakan NepgearBot! NepgearBot adalah 'best waifu bot' milik Ryo Kenrie (Damillora). BETA: Implementasi game Werewolf secara sederhana.";
var helptext = "Ini adalah NepgearBot, bot milik Ryo Kenrie (Damillora), yang bisa digunakan untuk ngespam group, atau bermain Werewolf!";
console.log("Started NepgearBot");

// Matches /nep
bot.onText(/\/nep/, function (msg) {
  console.log("/nep");
  var fromId = msg.chat.id;
  var nep = "Nep"

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
    var arrays = data.split(":");
    var command = arrays[0]
    var chatId = arrays[1]
    console.log(msg.from.first_name+":"+data);
    if(command == "nep"){
        bot.sendMessage(chatId,"Nep!");
    }else if(command == "nepnep"){
        bot.sendMessage(chatId,"Nep!Nep!");
        
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

bot.onText(/\/google/, function (msg){
console.log("/google");
  var fromId = msg.chat.id;
bot.sendMessage(fromId, "Apa yg ingin anda cari?", forcereplyopts).then(function (sended) {
    var chatId = sended.chat.id;
    var messageId = sended.message_id;
    bot.onReplyToMessage(chatId, messageId, function (message) {
      var googlequery = msg.text;
google(googlequery, function (err, res){ if (err) console.error(err) ;for (var i = 0; i < res.links.length; ++i) { var link = res.links[i]; 
bot.sendMessage(message.chat.id,link.title + ' - ' + link.href+"\n"+link.description);} 
  });});});});
