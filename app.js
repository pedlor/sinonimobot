//const env = require('.env')
const request = require('request-promise').defaults({ encoding: 'latin1' })
const cheerio = require('cheerio')
const http = require('http')
const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.token)

// start bot command
bot.start(async ctx => {
    name = ctx.update.message.from.first_name
    await ctx.replyWithMarkdown(`Olá, ${name}.
    \nBasta me enviar uma mensagem com uma palavra qualquer que eu mostrarei os sinônimos desta palavra.
    \n_Espero ser útil!_ ;)`)
})

// response when the user sends a text message
bot.on('text', async ctx => {
    word = ctx.update.message.text
    url = createUrl(word)
    await fetchData(url).then( async (response) => {
        if(response) {
            await ctx.replyWithMarkdown(`*${word}* é sinônimo de: `)
            await ctx.reply(response.toString())
        } else {
            ctx.replyWithMarkdown('Desculpe, não encontrei nada! 🙄')
        }
    }).catch((error) => {
        console.log(error)
        ctx.replyWithMarkdown('Desculpe, algo deu errado! 🙄')
    })
})

// create the url that will be scrapped
const createUrl = word => { return url = `https://www.sinonimos.com.br/${word}` }

// gets the html from the given URL and returns only the synonyms
const fetchData = async (url) => {
    let fetchedData
    try {
        fetchedData = await request(url)

        const $ = cheerio.load(fetchedData)
        let synonyms = $('.sinonimos').first().text()
        return synonyms
    } catch (error) {
        console.log(`Something went wrong:\n ${error}`)
        return null;
    }
}

// default reply when the user sends a non-text message
bot.on('message', async ctx => {
    ctx.reply('Eu não sei o que fazer com isso. Você precisa me enviar uma mensagem de texto')
})

// server configuration
const PORT = process.env.PORT || 8081
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.write(JSON.stringify({name: 'sinonimobot', ver: '1.0.0'}))
    res.end()
}).listen(PORT)

bot.startPolling()
