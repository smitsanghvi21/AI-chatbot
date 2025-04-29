from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from langchain.prompts import PromptTemplate
from langchain_openai import OpenAI
import os
from dotenv import load_dotenv
from urllib.parse import urljoin, urlparse
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize OpenAI
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

llm = OpenAI(
    model="gpt-3.5-turbo-instruct",
    temperature=0,
    api_key=api_key
)

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def get_all_links(soup, base_url):
    links = set()
    for a in soup.find_all('a', href=True):
        href = a['href']
        full_url = urljoin(base_url, href)
        if is_valid_url(full_url) and urlparse(full_url).netloc == urlparse(base_url).netloc:
            links.add(full_url)
    return links

def clean_webpage_text(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style", "nav", "footer", "header"]):
        script.decompose()
    
    # Get text
    text = soup.get_text()
    
    # Break into lines and remove leading and trailing space on each
    lines = (line.strip() for line in text.splitlines())
    # Break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # Drop blank lines
    text = ' '.join(chunk for chunk in chunks if chunk)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text

def extract_website_content(url, max_pages=5):
    try:
        # Get main page
        response = requests.get(url)
        response.raise_for_status()
        main_content = clean_webpage_text(response.text)
        
        # Get all links from main page
        soup = BeautifulSoup(response.text, 'html.parser')
        links = get_all_links(soup, url)
        
        # Get content from linked pages
        all_content = [main_content]
        for link in list(links)[:max_pages-1]:
            try:
                page_response = requests.get(link)
                page_response.raise_for_status()
                page_content = clean_webpage_text(page_response.text)
                all_content.append(page_content)
            except:
                continue
        
        # Combine all content
        combined_content = ' '.join(all_content)
        
        # Truncate if too long
        if len(combined_content) > 6000:
            combined_content = combined_content[:6000] + "..."
        
        return combined_content
    except Exception as e:
        raise Exception(f"Error extracting website content: {str(e)}")

@app.route('/')
def home():
    return jsonify({"message": "Server Running"})

@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.get_json()
        
        if not data or 'url' not in data or 'question' not in data:
            return jsonify({"error": "URL and question are required"}), 400
        
        url = data['url']
        question = data['question']
        
        # Extract website content
        website_text = extract_website_content(url)
        
        if not website_text:
            return jsonify({"error": "Could not extract text from webpage"}), 400
        
        # Create prompt template
        prompt_template = PromptTemplate(
            input_variables=["website_text", "question"],
            template="""You are a helpful assistant that extracts and provides ALL relevant information from the provided webpage content. Your task is to:

1. Extract and provide ALL information that matches the user's question, even if it's spread across different pages
2. Include specific details like:
   - Contact information (email, phone, address)
   - Course details (levels, fees, intakes)
   - Program information
   - Any other relevant details
3. If information is not found, clearly state that
4. Format the response in a clear, organized way

Webpage Content:
{website_text}

Question: {question}

Answer:"""
        )
        
        # Generate response
        prompt = prompt_template.format(website_text=website_text, question=question)
        response = llm.invoke(prompt)
        
        return jsonify({"answer": response})
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching webpage: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 