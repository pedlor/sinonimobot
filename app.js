//const env = require('./.env')
require('http').createServer(() => {
    console.log(`Server is running`)
}).listen(process.env.PORT)
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

// 'about' command
bot.command('sobre', ctx => {
    ctx.replyWithMarkdown(`❓ *Como usar?* - Para encontrar os sinônimos de uma palavra, envie uma mensagem de texto com a palavra em questão. Simples assim.
    \nMinha fonte de dados 📊 é o site [Sinônimos](https://sinonimos.com.br). Este bot não tem qualquer ligação com a equipe do Sinônimos.
    \n📢 Encontrou problemas? Tem alguma sugestão? Entre em contato com @cylonboy!
    \n👨‍💻 O código-fonte pode ser encontrado nesta página do [Github](https://github.com/pedlor/sinonimobot)`)
})

// response when the user sends a text message
bot.on('text', async ctx => {
    word = ctx.update.message.text
    url = createUrl(word)
    await fetchData(url).then(async (response) => {
        if (response) {
            for (i = 0; i < response.length; i++) {
                if (response[i].meaning != "") {
                    await ctx.replyWithMarkdown(`ℹ *Palavra*: ${word}
                    \n⚠ *Sentido da palavra*: ${response[i].meaning}
                    \n🔡 *Sinônimos*: ${response[i].synonyms}`)
                } else {
                    await ctx.replyWithMarkdown(`ℹ *Palavra*: ${word}
                    \n✅ *Sinônimos*: ${response[i].synonyms}`)
                }
            }
        } else {
            ctx.replyWithMarkdown('Desculpe, não encontrei nada! 🙄')
        }
    }).catch((error) => {
        ctx.replyWithMarkdown('Desculpe, algo deu errado! 🙄')
    })
})

// default reply when the user sends a non-text message
bot.on('message', ctx => {
    ctx.reply('Eu não sei o que fazer com isso. Você precisa me enviar uma mensagem de texto')
})

// create the url that will be scrapped
const createUrl = word => { return url = `https://www.sinonimos.com.br/${word}` }

// gets the html from the given URL and returns only the synonyms
const fetchData = async (url) => {
    let fetchedData
    try {
        fetchedData = await axios.request(url, { responseEncoding: 'latin1' })
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

bot.startPolling()