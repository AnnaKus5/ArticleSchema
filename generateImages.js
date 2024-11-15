import { JSDOM } from 'jsdom';
import fs from 'fs';
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config() 


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})  


async function findImagesPrompts(article) {
    const prompts = []
    
    const dom = new JSDOM(article)
    const doc = dom.window.document
    
    const imgElements = doc.getElementsByTagName('img')
    
    for (const img of imgElements) {
        const prompt = img.getAttribute('alt')
        if (prompt) {
            prompts.push({
                prompt: prompt,
                element: img 
            })
        }
    }
    return prompts
}

async function generateImages(prompts) {
    for (const prompt of prompts) {
        const image = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt.prompt,
            size: '1024x1024'
        })
        const imageUrl = image.data[0].url
        const response = await fetch(imageUrl)
        const buffer = await response.arrayBuffer()
        
        if (!fs.existsSync('images')) {
            fs.mkdirSync('images')
        }
        
        const filename = `images/${prompt.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
        
        fs.writeFileSync(filename, Buffer.from(buffer))
        
        prompt.element.setAttribute('src', filename)
    }     
}

function updateArticleWithImages(article, prompts) {
    const dom = new JSDOM(article)
    const doc = dom.window.document

    for (const prompt of prompts) {
        const filename = `images/${prompt.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
        const imgElements = doc.getElementsByTagName('img')
        
        for (const img of imgElements) {
            if (img.getAttribute('alt') === prompt.prompt) {
                img.setAttribute('src', filename)
                break
            }
        }
    }
    
    const articleElement = doc.querySelector('article')
    return articleElement ? articleElement.outerHTML : doc.documentElement.outerHTML
}

async function mainWithImages() { 
    const article = fs.readFileSync('artykul.html', 'utf8')
    const prompts = await findImagesPrompts(article)
    await generateImages(prompts) 
    const updatedArticle = updateArticleWithImages(article, prompts)
    fs.writeFileSync('articleWithImages.html', updatedArticle)
}

mainWithImages()