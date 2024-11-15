# AI-Powered Article HTML Converter

This project converts plain text articles into semantically structured HTML with AI-generated image suggestions. It uses OpenAI's GPT-4o for content analysis and structure generation.

## Features

- Converts plain text to semantic HTML
- Adds strategically placed image suggestions with AI-optimized alt text
- Generates Polish language image captions
- Maintains original content integrity
- Ensures accessibility standards
- Automated image generation (optional feature)

## Project Structure
```bash
index.js # Main application file
generateImages.js # Optional image generation automation
.env # Environment variables
article.txt # Input article file
article.html # Output HTML file
```

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [project-directory]
``` 

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Usage

### Main Functionality (index.js)

1. Place your article in `article.txt` or use the fetch functionality to download from URL

2. Run the main script:
```bash
node index.js
```

3. The processed HTML will be saved to `article.html`. You can paste it into `podglad.html` to preview the result.

### Image Generation (generateImages.js)

This is an optional feature to automate the generation of images based on the AI-generated suggestions.

```bash
node generateImages.js
```
Output images will be saved in the `images` folder. Updates article will be saved in `articleWithImages.html`.

## Environment Variables

Required environment variables in `.env`:

```
OPENAI_API_KEY=your_api_key_here
```

Optional environment variables:
```
MODEL=gpt-4              # OpenAI model selection
ARTICLE_PATH=article.txt # Input file path
OUTPUT_PATH=article.html # Output file path
```

## Configuration

The project uses a CONFIG object in `index.js` that can be modified:

```javascript
const CONFIG = {
    ARTICLE_URL: 'https://example.com/article.txt',
    ARTICLE_PATH: 'article.txt',
    OUTPUT_PATH: 'article.html',
    MODEL: 'gpt-4o'
}
```

## Error Handling

The application includes error handling for:
- Invalid input files
- API failures
- File system operations
- Content validation

Error messages will be logged to the console with relevant details.

## Limitations

- API rate limits apply based on your OpenAI account
- Image generation requires additional API calls
- Large articles may require multiple API requests