# Webpage Q&A Chatbot

A full-stack web application that allows users to ask questions about any website's content. The application uses LangChain and OpenAI to provide intelligent responses based on the website's content.

<img width="2042" alt="screenshot" src="https://github.com/user-attachments/assets/ee7231ca-a165-4310-b184-e9e5369b04c0" />


## Features

- Extract and analyze content from any website
- Chat-like interface with message history
- Follow-up questions and suggested queries
- Real-time responses using OpenAI's GPT model
- Clean and responsive UI with Bootstrap 5

## Tech Stack

### Frontend
- React.js
- Bootstrap 5
- Axios for API calls

### Backend
- Python Flask
- LangChain
- OpenAI GPT-3.5
- BeautifulSoup4 for web scraping

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd webpage-qa-chatbot
```

2. Set up the backend:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Set up the frontend:
```bash
npm install
```

5. Run the application:

Backend:
```bash
python app.py
```

Frontend:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Usage

1. Enter a website URL in the input field
2. Type your question or select from suggested questions
3. View the AI-generated response
4. Use follow-up questions to continue the conversation

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
