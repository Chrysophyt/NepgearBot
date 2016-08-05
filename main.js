var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var http = require('http');
var mysql = require('mysql');

var TelegramBot = require('node-telegram-bot-api');

var token = '264518223:AAGeLZ5-gVfH6ZgILNFrvFlEyZtpk_dzLx0';
var port = 8080;
console.log("Port is "+port);
var host = "0.0.0.0";

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
  bot.sendMessage(fromId, nep,inlineopts).then(function (sended) {
    var chatId = sended.chat.id;
    var messageId = sended.message_id;
    bot.onReplyToMessage(chatId, messageId, function (message) {
      bot.sendMessage(message.chat.id,"Nep!");
    });
  });
});

bot.onText(/\/setwaifu/, function (msg) {
  console.log("/setwaifu");
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

