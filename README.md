# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# TisAI WorldAPI Connect

## Chatbot Issue Fix

The chatbot was experiencing an issue where it would get stuck in a loop, repeating the message "I understand. Let's move forward with your WorldAPI integration. Is there anything specific you'd like to know about the API?" even after responding with "no".

### Solution implemented:

1. Added explicit conversation state management with a `currentStep` variable tracking the current conversation stage:
   - welcome
   - name
   - organization
   - email
   - connection
   - api-questions
   - completed

2. Added persistent state storage using localStorage to maintain conversation state across hot module reloads, which may have been contributing to the issue.

3. Improved the logic for handling "no" responses with exact string matching:
   ```typescript
   if (userTextLower === 'no' || userTextLower === 'nope' || userTextLower === 'nothing' || userTextLower === 'not really') {
     responseContent = "Perfect! You're all set with the WorldAPI integration basics. If you have questions later, you can always reach out to our support team.";
     nextStep = 'completed';
   }
   ```

4. Added detailed debug logging to help identify conversation flow issues.

5. Implemented a reset button to clear conversation state if needed.

### Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### Testing

Test cases added to verify:
- Conversation flow progression
- Proper handling of "no" responses
- Conversation reset functionality

## Next Steps

If issues persist, consider:
1. Using a more robust state management solution like Redux or Zustand
2. Adding telemetry to track conversation flow in production
3. Implementing proper error boundaries to catch and recover from unexpected issues
