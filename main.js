var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var http = require('http');

var TelegramBot = require('node-telegram-bot-api');

var token = '264518223:AAGeLZ5-gVfH6ZgILNFrvFlEyZtpk_dzLx0';
var port = 8080;
console.log("Port is "+port);
var host = "0.0.0.0";

console.log("Starting NepgearBot");
var bot = new TelegramBot(token, {polling: true});

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
var starttext = "Ini adalah NepgearBot, bot milik Ryo Kenrie Wongso (Damillora). Saat ini hanya untuk coba-coba. Versi adalah 0.2";
var helptext = "NepgearBot: bot punya Ryo. Lapor semua bug ke Ryo.";
console.log("Started NepgearBot");

// Matches /nep
bot.onText(/\/nep/, function (msg) {
  console.log("/nep");
  var fromId = msg.chat.id;
  var nep = "Nep"
  bot.sendMessage(fromId, nep);
});

bot.onText(/\/lapar/, function (msg) {
  console.log("/");
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


bot.onText(/\/echo (.+)/, function (msg, match) {
  console.log("/echo");
  var fromId = msg.chat.id;
  var nep = match[1];
  bot.sendMessage(fromId, nep);
});

bot.onText(/\/echo@NepgearBot (.+)/, function (msg, match) {
  console.log("/echo");
  var fromId = msg.chat.id;
  var nep = match[1];
  bot.sendMessage(fromId, nep);
});

bot.onText(/\/me (.+)/, function (msg, match) {
  console.log("/me");
  var fromId = msg.chat.id;
  var userName = msg.from.first_name;
  var nep = match[1];
  bot.sendMessage(fromId, "* "+userName+" "+nep);
});

bot.onText(/\/me@NepgearBot (.+)/, function (msg, match) {
  console.log("/me");
  var fromId = msg.chat.id;
  var userName = msg.from.first_name;
  var nep = match[1];
  bot.sendMessage(fromId, "*"+userName+" "+nep);
});

/*
bot.onText(/\/nep (.+)/, function (msg, match) {
  console.log("/nep");
  var fromId = msg.chat.id;
  var nep = "nep"
  bot.sendMessage(fromId, nep);
});
*/

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

