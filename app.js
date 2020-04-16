//const env = require('./.env')
require('http').createServer(() => {
    console.log(`Server is running`)
}).listen(3000)
const axios = require('axios')
const cheerio = require('cheerio')
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
            for(i = 0; i < response.length; i++) {
                let meaningText =''
                if(response[i].meaning != "") {
                    meaningText = `🔶 Sentido da palavra: *${response[i].meaning}*`
                }
                let synonymsText = `✅ *Sinônimos*: ${response[i].synonyms}`
                await ctx.replyWithMarkdown(meaningText + "\n\n" + synonymsText)
            }
        } else {
            ctx.replyWithMarkdown('Desculpe, não encontrei nada! 🙄')
        }
    }).catch((error) => {
        ctx.replyWithMarkdown('Desculpe, algo deu errado! 🙄')
    })
})

// create the url that will be scrapped
const createUrl = word => { return url = `https://www.sinonimos.com.br/${word}` }

// gets the html from the given URL and returns only the synonyms
const fetchData = async (url) => {
    let fetchedData
    try {
        fetchedData = await axios.request(url, { responseEncoding : 'latin1'} )
        const $ = cheerio.load(fetchedData.data)
        
        $('.number').remove()
        let synonymsArray = []
        $('.s-wrapper').each((i, el) => {
            let obj = {}
            let meaning = $(el).find('.sentido').text()
            let synonyms = $(el).find('.sinonimos').text()
            obj.meaning = meaning.replace(':', '')
            obj.synonyms = synonyms.substring(1)
            
            synonymsArray[i] = obj
        })

        return synonymsArray
    } catch (error) {
        console.log(`Error status:\n ${error.status}`)
        return null;
    }
}

// default reply when the user sends a non-text message
bot.on('message', async ctx => {
    ctx.reply('Eu não sei o que fazer com isso. Você precisa me enviar uma mensagem de texto')
})

bot.startPolling()