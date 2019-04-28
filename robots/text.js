const algorithmia = require('algorithmia')
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

// interface publica
async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content) {
        const input = {
            "articleName": content.searchTerm,
            "lang": "pt"
          };

        // autentica
        const algorithmiaAuthenticated = algorithmia(algorithmiaKey)
        // escolhe o algoritmo
        const wikipediaAlgorithmia = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        // faz a pesquisa
        const wikipediaResponse = await wikipediaAlgorithmia.pipe(content.searchTerm)
        // const wikipediaResponse = await wikipediaAlgorithmia.pipe(input)
        // retorna o conteúdo
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
                    
        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }

                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }

        content.sourceContentSanitized = withoutBlankLinesAndMarkdown
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robot