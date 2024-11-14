import fs from 'fs'
import axios from 'axios'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const url = 'https://cdn.oxido.pl/hr/Zadanie%20dla%20JJunior%20AI%20Developera%20-%20tresc%20artykulu.txt'

//pobrać plik przez API

async function fetchArticle(url) {
    const response = await axios.get(url)
    return response.data
}
// zapisać treść do pliku

async function saveArticle(article) {
    fs.writeFileSync('article.txt', article)
}

async function main() {
    const article = await fetchArticle(url)
    await saveArticle(article)
    const htmlArticle = await generateHTML(article)
    console.log('HTML Article:', htmlArticle)
}

main()

async function generateHTML(article) {

    const systemPrompt = `
    You are an expert HTML formatter.
    Your task is to structure the provided article text into proper HTML format.

    Instructions:
    1. Analyze the article's structure and content
    2. Add appropriate HTML tags to organize the content (h1, h2, p, ul, etc.)
    3. Preserve all original text exactly as provided
    4. Do not add any additional text or commentary
    5. Return only the HTML-formatted article
    6. Use semantic HTML tags where appropriate

    Format: Return the article wrapped in <article> tags with proper internal structure
    `

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Article: ${article}`
                }
            ],
        })
        console.log(response.choices[0].message.content)
        return response.choices[0].message.content
    } catch (error) {
        console.error('Error generating HTML:', error)
    }
}


// wysłać do OpenAI: strukturyzacja treści: tagi HTML -> textHTML

// wysłać od OpenAI: sugerowane obrazki -> output w formacie JSON {article: artykuł z tagami HTML , prompts: []}
// lub lepiej tylko artykuł i wyciągnąć listę promptów ze struktury HTML? chyba bardziej pewne rozwiazanie

// zapisać zwrócony output w pliku artykul.html

// funkcja pomocnicza mapująca przez tablice promptów i wysyłająca zapytanie do modelu o wygenerowanie obrazka?
// zapisanie obrazków w folderze images


