# AI Assistant Application

## Overview
This is a React-based AI Assistant application that interfaces with OpenAI's API to provide various AI-powered functionalities including general chat, email writing, translation, interview preparation, and text summarization.

## Features
- Multiple AI assistance modes:
  - General Chat
  - Email Writing
  - Translation
  - Interview Preparation
  - Text Summarization
- File upload support for translation and summarization
- Real-time API communication with OpenAI
- Responsive design using Tailwind CSS
- Error handling and user feedback
- Secure API key management

## Project Structure

```
src/
├── components/
│   ├── ApiKeyDialog.tsx     # Dialog for setting OpenAI API key
│   ├── ChatInput.tsx        # User input component
│   ├── ChatInterface.tsx    # Main chat interface logic
│   ├── ChatResponse.tsx     # Response display component
│   └── FileUpload.tsx       # File upload handling component
├── utils/
│   └── openai.ts           # OpenAI API communication utilities
├── pages/
│   └── Index.tsx           # Main page component
├── App.tsx                 # Root application component
└── main.tsx               # Application entry point
```

## Component Details

### ApiKeyDialog.tsx
Handles the secure storage of the OpenAI API key in localStorage and provides a dialog interface for users to input their API key.

```typescript
// Key features:
- Dialog interface for API key input
- Secure storage in localStorage
- User feedback via toast notifications
```

### ChatInput.tsx
Manages user input and message submission with loading states and validation.

```typescript
// Key features:
- Text input for user messages
- Loading state handling
- Submit button with status indication
```

### ChatInterface.tsx
Core component managing the chat interaction logic and API communication.

```typescript
// Key features:
- Mode-specific system prompts
- Error handling
- API communication
- Response management
```

### ChatResponse.tsx
Displays the AI response in a formatted card layout.

```typescript
// Key features:
- Formatted response display
- Whitespace preservation
- Conditional rendering
```

### FileUpload.tsx
Handles file uploads for translation and summarization modes.

```typescript
// Key features:
- File type validation
- Text extraction
- Error handling
```

## Setup and Running

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

1. Set your OpenAI API key using the "Set OpenAI API Key" button
2. Select the desired mode from the dropdown menu
3. For translation or summarization:
   - Upload a text file if needed
   - Or type/paste text directly
4. Enter your message and click "Send Message"
5. View the AI response in the card below

## Technical Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- OpenAI API
- React Query for API state management

## Error Handling

The application includes comprehensive error handling for:
- Network issues
- API key validation
- Rate limiting
- Timeout handling
- File upload validation

## Security Considerations

- API keys are stored in localStorage
- File validation prevents unauthorized file types
- Error messages are user-friendly without exposing sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.