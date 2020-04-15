const axios = require('axios')
const cheerio = require('cheerio')

const url = 'https://www.sinonimos.com.br/purificar'

const fetchData = async (url) => {
    let fetchedData
    //await axios.get(url).then((response) => {
    try {
        fetchedData = await axios.request(url, { responseEncoding: 'latin1' })

        const $ = cheerio.load(fetchedData.data)
        //console.log($)
        //let synonyms = `Sentido: ${$('.sentido').first.text()}\n`
        $('.number').remove()
        let synonymsArray = []
        $('.s-wrapper').each((i, el) => {
            let obj = {}
            let meaning = $(el).find('.sentido').text()
            let synonyms = $(el).find('.sinonimos').text()
            obj.meaning = meaning.replace(':', '')
            obj.synonyms = synonyms.substring(1)
            synonymsArray[i] = obj
            //synonymsArray[i] = "Sentido: " + $(el).find('.sentido').text() + "\n" + $(el).find('.sinonimos').text() + "\n"
        })
        //let synonyms = "Sentido: " + $('.sentido').first().text() + "\n" + $('.sinonimos').first().text()
        //console.log($('.sinonimos').first().find('.sinonimo').first().text())
        return synonymsArray
    } catch (error) {
        //console.log("error = " + error)
        return null;
    }
}

const main = async () => {
    const data = await fetchData(url).then((response) => {
        if(response) {
            for(i = 0; i < response.length; i++) {
                console.log(`ℹ Sentido da palavra: ${response[i].meaning}\n`)
                console.log(`✅ Sinônimos:\n${response[i].synonyms}`)
            }
            //console.log("resposta = " + response.toString())
        } else {
            console.log("erro 404 - nao achei a palavra")
        }
    }).catch((error) => {
        console.log(error)
        console.log('nao foi')
    })

    console.log('continuando o programa')
}

const printData = (obj, ctx) => {
    ctx.replyWithMarkdown(obj.meaning)
    ctx.replyWithMarkdown(obj.synonyms)
}

//data = fetchData(url)
//match = getSynonyms(data)
main()

