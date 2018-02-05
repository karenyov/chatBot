// load env variables from the .env file
require('dotenv-extended').load()

var restify = require('restify');
var builder = require('botbuilder');
var cognitiveServices = require('botbuilder-cognitiveservices')

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Crie um chat conector para se comunicar com o Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen())

var bot = new builder.UniversalBot(connector)
bot.set('storage', new builder.MemoryBotStorage())

// Receive messages from the user and respond by echoing each message back 
bot = new builder.UniversalBot(connector, function (session) {
    session.send("You sent: %s wich was %s characters", session.message.text, session.message.text.length);
});

bot.set('storage', new builder.MemoryBotStorage())
server.post('/api/messages', connector.listen())

bot.on('deleteUserData', (message) => {
    console.log(`deleteUserData ${JSON.stringify(message)}`)
})

bot.on('conversationUpdate', (message) => {
    console.log(`conversationUpdate ${JSON.stringify(message)}`)
})

bot.on('contactRelationUpdate', (message) => {
    console.log(`contactRelationUpdate ${JSON.stringify(message)}`)
})

bot.on('typing', (message) => {
    console.log(`typing ${JSON.stringify(message)}`)  
})

bot.on('ping', (message) => {
    console.log(`ping ${JSON.stringify(message)}`)
})