if (process.env.NODE_ENV !== 'production') {
    const env = require('./.env');
}

require('http').createServer(() => {	
    console.log(`Bot is running`);	
}).listen(process.env.PORT);
const axios = require('axios');	
const cheerio = require('cheerio');	
const Telegraf = require('telegraf');	
const session = require('telegraf/session');	
const bot = new Telegraf(process.env.token || env.token);	
    
bot.use(session());	
    
// bot error handling	
bot.catch((err, ctx) => {	
  console.log(`Ooops, encountered an error for ${ctx.updateType}.\nError code ${err.code}. Description: ${err.response.description}`);	
})	
    
// start bot command	
bot.start(ctx => {	
    const name = ctx.update.message.from.first_name;	
    ctx.replyWithMarkdown(`Olá, ${name}.	
    \nBasta me enviar uma mensagem com uma palavra qualquer que eu mostrarei os sinônimos desta palavra.	
    \n_Espero ser útil!_ ;)`);	
})	
    
// 'about' command	
bot.command('sobre', ctx => {	
    ctx.replyWithMarkdown(`❓ *Como usar?* - Para encontrar os sinônimos de uma palavra, envie uma mensagem de texto com a palavra em questão. Simples assim.	
    \nMinha fonte de dados 📊 é o site [Sinônimos](https://sinonimos.com.br). Este bot não tem qualquer ligação com a equipe do Sinônimos.	
    \n📢 Encontrou problemas? Tem alguma sugestão? Entre em contato com @cylonboy!	
    \n👨‍💻 O código-fonte pode ser encontrado nesta página do [Github](https://github.com/pedlor/sinonimobot)`)	
})	
    
// bot.on("text", ctx => {	
//   ctx.reply("Bot em manutenção");	
// });	
    
//response when the user sends a text message	
bot.on('text', async ctx => {	
    const word = ctx.update.message.text;	
    const url = createUrl(word);	
    try {	
        const res = await fetchData(url);	
        if (!res) {	
            return ctx.replyWithMarkdown('Desculpe, não encontrei nada! 🙄');	
        }	
    
        for (let i = 0; i < res.length; i++) {	
            if (res[i].meaning != "") {	
                ctx.replyWithMarkdown(`ℹ *Palavra*: ${word}	
                    \n⚠ *Sentido da palavra*: ${res[i].meaning}	
                    \n🔡 *Sinônimos*: ${res[i].synonyms}`)	
            } else {	
                ctx.replyWithMarkdown(`ℹ *Palavra*: ${word}	
                    \n✅ *Sinônimos*: ${res[i].synonyms}`)	
            }	
        }	
    } catch (err) {	
        ctx.replyWithMarkdown('Desculpe, algo deu errado! 🙄')	
        console.log(err);	
    }	
});	
    
// default reply when the user sends a non-text message	
bot.on('message', ctx => {	
    ctx.reply('Eu não sei o que fazer com isso. Você precisa me enviar uma mensagem de texto')	
})	
    
// create the url that will be scrapped	
const createUrl = word => { return `https://www.sinonimos.com.br/${word}` }	
    
// gets the html from the given URL and returns only the synonyms	
const fetchData = async (url) => {	
    let fetchedData;	
    try {	
        fetchedData = await axios.request(url, { responseEncoding: 'latin1' }).catch((err) => {	
            throw new Error(err);	
        })	
        const $ = cheerio.load(fetchedData.data);	
    
        $('.number').remove()	
        let synonymsArray = []	
        $('.s-wrapper').each((i, el) => {	
            let obj = {}	
            let meaning = $(el).find('.sentido').text();	
            let synonyms = $(el).find('.sinonimos').text();	
            obj.meaning = meaning.replace(':', '');	
            obj.synonyms = synonyms.substring(1);	
            synonymsArray[i] = obj;	
        })	
    
        return synonymsArray;	
    } catch (err) {	
        console.log(`Axios bad request. Word not found or target unreachable.`);	
        return null;	
    }	
}	
    
bot.launch();