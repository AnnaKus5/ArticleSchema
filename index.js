import fs from 'fs'
import axios from 'axios'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const url = 'https://cdn.oxido.pl/hr/Zadanie%20dla%20JJunior%20AI%20Developera%20-%20tresc%20artykulu.txt'


async function fetchArticle(url) {
    const response = await axios.get(url)
    return response.data
}

async function saveArticle(article) {
    fs.writeFileSync('article.txt', article)
}


async function generateHTML(article) {

    const systemPrompt = `
    You are an expert HTML formatter specializing in semantic structure and accessibility.
    Your task is to convert plain text articles into well-structured, semantic HTML.

    <task>
    1. Analyze the article's structure to identify:
       - Main heading and subheadings
       - Paragraphs and text blocks
       - Lists and enumerations
       - Quotes or highlighted text
       - Natural content sections
       
    2. Apply semantic HTML tags if needed:
       - <article> for the main container
       - <header> for introductory content
       - <h1> through <h6> for proper heading hierarchy
       - <p> for paragraphs
       - <section> for thematic grouping
       - <ul>/<ol> for lists
       - <blockquote> for quotes
       - <strong> and <em> for emphasis
       - You can use other tags if needed.
    </task>

    <rules>
       1. ABSOLUTELY FORBIDDEN to change any part of the original content besides adding html tags.
       2. UNDER NO CIRCUMSTANCES provide additional comments outside of the HTML output.
       3. You don't have to use all of the tags from the list.
       4. Ensure accessibility by using proper heading hierarchy and maintaining logical reading flow.
    </rules>
    
    <formatting requirements>
       - Preserve all original text exactly as provided     
       - UNDER NO CIRCUMSTANCES provide additional comments outside of the HTML output.
       - Do not add any additional content
       - Use proper indentation for nested elements
       - Include appropriate spacing between sections
       - Validate HTML structure
    </formatting requirements>
    
    <expected output>
    Return ONLY the properly formatted HTML with semantic structure and accessibility features.
    Do not use markdown syntax to present the content.
    </expected output>
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
        return response.choices[0].message.content
    } catch (error) {
        console.error('Error generating HTML:', error)
    }
}

//add description under the images
async function addImgTags(article) {
    const systemPrompt = `
    You are an expert at analyzing content and suggesting relevant images. 

    <task>
    Ensure HTML articles include strategic <img> tags with specific alt text prompts for image generation, seamlessly integrated without altering existing content.
    The style of the images should match the article's content.
    The sole purpose is to analyze article content to insert <img> tags with descriptive alt text, fitting naturally into the flow and preserving all other content.
    </task>

    <rules>
    1. ABSOLUTELY FORBIDDEN to change any part of the original content besides adding <img> tags.
    2. UNDER NO CIRCUMSTANCES provide additional comments outside of the HTML output.
    3. Analyze content to identify key points where images enhance understanding.
    4. ALT attributes must be specific, descriptive, and contextually accurate image prompts.
    5. Limit the number of <img> tags to a range of 3-5 for optimal impact.
    </rules>

    <examples>
    USER: <article><h1>Solar System</h1><p>The solar system consists of the sun and astronomical objects.</p></article>
    AI: <article><h1>Solar System</h1><p>The solar system consists of the sun and astronomical objects.</p><img src="" alt="illustration of the solar system including the sun and planets"></article>

    USER: <article><h2>Photosynthesis Process</h2><p>Photosynthesis converts light energy into chemical energy in plants.</p></article>
    AI: <article><h2>Photosynthesis Process</h2><p>Photosynthesis converts light energy into chemical energy in plants.</p><img src="" alt="diagram of the photosynthesis process showing light energy conversion"></article>

    USER: <article><p>History of the internet</p><h2>Origins</h2><p>The internet began as ARPANET.</p></article>
    AI: <article><p>History of the internet</p><h2>Origins</h2><p>The internet began as ARPANET.</p><img src="" alt="historical image of ARPANET network map"></article>

    USER: <article><p>Cats are popular pets</p></article>
    AI: <article><p>Cats are popular pets</p><img src="" alt="popular cat breeds sitting together"></article>

    USER: <article><p>Robots in modern industry</p></article>
    AI: <article><p>Robots in modern industry</p><img src="" alt="robotic arms working in a factory assembly line"></article>
    </examples>
    
    <format>
    Ensure each <img> tag is neatly integrated into the HTML structure, matching the article's context and flow.
    Return ONLY the properly formatted HTML with semantic structure and accessibility features.
    Do not use markdown syntax to present the content.
    </format>
    `

    // we can define specific style of the images and add it to the prompt
    const imagesStyle = `
        Apply the following style to the images:
        eg. cartoonish, anime style, digital art, watercolor, oil painting, digital painting, digital art, watercolor, oil painting, digital painting
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
            ]
        })
        console.log("HTML with img tags:", response.choices[0].message.content)
        return response.choices[0].message.content
    } catch (error) {
        console.error('Error during adding img tags:', error)
    }
}

async function main() {
    const article = await fetchArticle(url)
    await saveArticle(article)
    const htmlArticle = await generateHTML(article)
    console.log('HTML Article:', htmlArticle)
    await addImgTags(htmlArticle)
}

main()

// TODO:

// save the output in the file article.html
// write a function that will take the article and the list of prompts and generate images for each prompt
// save the images in the images folder
// update the html file with the new images paths   


