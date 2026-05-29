# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Environment Variables

To use the Hugging Face script analysis feature, create a `.env` file at the project root and add your API key:

```env
VITE_HF_API_KEY=your_huggingface_api_key_here
```

After creating or updating `.env`, restart the development server.

### Deployments (GitHub Actions / Azure)

The production site is built during CI. Vite embeds env vars at build time, so you must set the Hugging Face key as a repository secret for GitHub Actions.

1. In your GitHub repository, go to **Settings → Secrets and variables → Actions → New repository secret**.
2. Add a secret named `VITE_HF_API_KEY` with your Hugging Face API key as the value.
3. Push to `main` (the workflow will read this secret during the `npm run build` step and embed it into the build).

Alternatively, if you use Azure Static Web Apps directly, you can configure application settings in the Azure Portal, but for static builds the key still needs to be available during the build step.

Security note: rotate the key if it was ever committed to the repository.
