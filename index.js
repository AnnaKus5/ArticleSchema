import fs from 'fs'
import axios from 'axios'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const CONFIG = {
    ARTICLE_URL: 'https://cdn.oxido.pl/hr/Zadanie%20dla%20JJunior%20AI%20Developera%20-%20tresc%20artykulu.txt',
    ARTICLE_PATH: './source/article.txt',
    OUTPUT_PATH: 'artykul.html',
    MODEL: 'gpt-4o'
}

// additional functions to fetch and save the article from url
async function fetchArticle() {
    const url = CONFIG.ARTICLE_URL
    try {
        const response = await axios.get(url)
        return response.data
    } catch (error) {
        console.error('Error fetching article:', error)
        throw error
    }
}

async function saveArticle(article) {
    fs.writeFileSync(CONFIG.ARTICLE_PATH, article)
}

// generate HTML structure from the article
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
    
    <format>
       - Preserve all original text exactly as provided     
       - UNDER NO CIRCUMSTANCES provide additional comments outside of the HTML output.
       - Do not add any additional content
       - Use proper indentation for nested elements
       - Include appropriate spacing between sections
       - Validate HTML structure
    </format>
    
    <expected output>
    Return ONLY the properly formatted HTML with semantic structure and accessibility features.
    Do not use markdown syntax to present the content.
    </expected output>
    `

    try {
        const response = await openai.chat.completions.create({
            model: CONFIG.MODEL,
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

// add images to the article
async function addImgTags(article) {
    const systemPrompt = `
    You are an expert at analyzing content and suggesting relevant images. 

    <task>
    Ensure HTML articles include strategic <figure> elements containing <img> tags and <figcaption> elements, seamlessly integrated without altering existing content.
    The style of the images should match the article's content.
    The sole purpose is to analyze article content to insert image elements with AI image generation prompts as alt text and meaningful captions that relate to the article's themes.
    </task>

    <rules>
    1. ABSOLUTELY FORBIDDEN to change any part of the original content besides adding image-related elements.
    2. UNDER NO CIRCUMSTANCES provide additional comments outside of the HTML output.
    3. Analyze content to identify key points where images enhance understanding.
    4. ALT attributes MUST contain specific prompts suitable for AI image generation (like DALL-E or Stable Diffusion).
    5. SRC attribute MUST be "image_placeholder.jpg"
    6. Limit the number of image insertions to a range of 3-5 for optimal impact.
    7. Each image must be wrapped in a <figure> element with both an <img> and a <figcaption>.
    8. Figcaptions should provide meaningful descriptions in Polish that connect the image to the article's key messages and themes, while alt text should be optimized for AI image generation.
    </rules>

    <alt text guidelines>
    - Format alt text as clear, detailed image generation prompts
    - Maintain consistent visual style across all images in the article
    - Choose a style that matches the content's tone and purpose (e.g., all images in modern digital art style for tech topics)
    - Specify important details like perspective, lighting, and composition
    - Keep prompts concise but descriptive enough for accurate image generation
    - Ensure the generated image will support and enhance the article's message
    - Use the same artistic style keywords in all image prompts for visual coherence
    </alt text guidelines>

    <examples>
    USER: <article><h1>Solar System</h1><p>The solar system consists of the sun and astronomical objects.</p></article>
    AI: <article><h1>Solar System</h1><p>The solar system consists of the sun and astronomical objects.</p>
    <figure>
        <img src="" alt="3D render of the solar system, dramatic lighting, photorealistic, showing sun at center with all 8 planets orbiting, cosmic background with stars, high detail">
        <figcaption>Układ słoneczny jako przykład złożonego systemu, gdzie wszystkie elementy współpracują ze sobą w harmonii</figcaption>
    </figure></article>

    USER: <article><h2>Photosynthesis Process</h2><p>Photosynthesis converts light energy into chemical energy in plants.</p></article>
    AI: <article><h2>Photosynthesis Process</h2><p>Photosynthesis converts light energy into chemical energy in plants.</p>
    <figure>
        <img src="" alt="digital illustration, cross-section of a green leaf showing photosynthesis process, sunlight beams entering leaf cells, chloroplasts visible, educational diagram style, vibrant colors">
        <figcaption>Proces fotosyntezy jako przykład naturalnej transformacji energii, podobnie jak AI przekształca dane w użyteczne informacje</figcaption>
    </figure></article>

    USER: <article><p>History of the internet</p><h2>Origins</h2><p>The internet began as ARPANET.</p></article>
    AI: <article><p>History of the internet</p><h2>Origins</h2><p>The internet began as ARPANET.</p>
    <figure>
        <img src="" alt="retro-style technical diagram, ARPANET network map circa 1970s, showing connected computer nodes and institutions, vintage computer aesthetic, muted colors, technical drawing style">
        <figcaption>Początki internetu jako przykład ewolucji technologii, pokazujący jak innowacje prowadzą do przełomowych zmian w społeczeństwie</figcaption>
    </figure></article>
    </examples>
    
    <format>
    - Wrap each image in a <figure> element
    - Include <img> with AI generation prompts as alt text
    - Include <figcaption> with human-readable descriptions
    - Ensure proper HTML structure and indentation
    - Place figures at logical breaks in the content
    - Return ONLY the properly formatted HTML
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
            model: CONFIG.MODEL,
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
        return response.choices[0].message.content
    } catch (error) {
        console.error('Error during adding img tags:', error)
    }
}

// remove unnecessary markdown syntax from the output (in some cases it's needed)
function validateOutput(article) {
    const cleanedArticle = article.replace(/^```html\n|\n```$/g, '')
    return cleanedArticle
}   

// Add basic validation for empty article
function validateArticle(article) {
    if (!article || typeof article !== 'string') {
        throw new Error('Invalid article format')
    }
    if (article.length === 0) {
        throw new Error('Empty article')
    }
    return true
}

async function main(articlePath) {
    try {
        const article = fs.readFileSync(articlePath, 'utf8')
        validateArticle(article)
        
        const htmlArticle = await generateHTML(article)
        if (!htmlArticle) throw new Error('HTML generation failed')
        
        const imgArticle = await addImgTags(htmlArticle)
        if (!imgArticle) throw new Error('Image tags addition failed')
        
        const validatedArticle = validateOutput(imgArticle)
        
        await fs.promises.writeFile(CONFIG.OUTPUT_PATH, validatedArticle)
        console.log('Article processing completed successfully')
    } catch (error) {
        console.error('Error processing article:', error)
        process.exit(1)
    }
}
 
main(CONFIG.ARTICLE_PATH)


