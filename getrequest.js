const axios = require('axios')
const request = require('request-promise').defaults({ encoding: 'latin1' })
const cheerio = require('cheerio')

const url = 'https://www.sinonimos.com.br/undefined'

const fetchData = async (url) => {
    let fetchedData
    //await axios.get(url).then((response) => {
    try {
        fetchedData = await request(url)

        const $ = cheerio.load(fetchedData)
        //console.log($)
        let synonyms = $('.sinonimos').first().text()
        //console.log($('.sinonimos').first().find('.sinonimo').first().text())
        return synonyms
    } catch (error) {
        //console.log("error = " + error)
        return null;
    }
}

const getSynonyms = res => {
    const $ = cheerio.load(res)
    //console.log($)
    let synonyms = []
    $('.sinonimos').first().find('.sinonimo').each((i, el) => {
        synonyms.push(($(el).text()))
    })
    //console.log($('.sinonimos').first().find('.sinonimo').first().text())
    return $('.sinonimos').first().find('.sinonimo').first().text()
}

const main = async () => {
    const data = await fetchData(url).then((response) => {
        if(response) {
            console.log("resposta = " + response.toString())
        } else {
            console.log("erro 404 - nao achei a palavra")
        }
    }).catch((error) => {
        console.log(error)
        console.log('nao foi')
    })

    console.log('continuando o programa')
}

//data = fetchData(url)
//match = getSynonyms(data)
main()

