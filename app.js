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

const bot = new builder.UniversalBot(connector)
bot.set('storage', new builder.MemoryBotStorage())
server.post('/api/messages', connector.listen())

// Endpoint que irá monitorar as mensagens do usuário

const recognizer = new cognitiveServices.QnAMakerRecognizer({
    knowledgeBaseId: process.env.QNA_KNOWLEDGE_BASE_ID,
    subscriptionKey: process.env.QNA_SUBSCRIPTION_KEY,
    top: 3
})

const qnaMakerTools = new cognitiveServices.QnAMakerTools()
bot.library(qnaMakerTools.createLibrary())

const basicQnaMakerDialog = new cognitiveServices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: 'Não encontrado! Tente alterar os termos da pergunta!',
    qnaThreshold: 0.5,
    feedbackLib: qnaMakerTools
})

basicQnaMakerDialog.respondFromQnAMakerResult = (session, qnaMakerResult) => {
    const firstAnswer = qnaMakerResult.answers[0].answer
    const composedAnswer = firstAnswer.split(';')
    if (composedAnswer.length === 1) {
    return session.send(firstAnswer)
    }
    const [title, description, url, image] = composedAnswer
    const card = new builder.HeroCard(session)
        .title(title)
        .text(description)
        .images([builder.CardImage.create(session, image.trim())])
        .buttons([builder.CardAction.openUrl(session, url.trim(), 'Comprar agora')])
    const reply = new builder.Message(session).addAttachment(card)
    session.send(reply)
}

bot.dialog('/', basicQnaMakerDialog)