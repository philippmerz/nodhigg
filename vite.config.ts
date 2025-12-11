import { defineConfig } from 'vite';

export default defineConfig({
  // Use repository name as base path for GitHub Pages
  // This assumes the repo is deployed to https://<username>.github.io/<repo-name>/
  // Change to '/' if using a custom domain or deploying to root
  base: '/nodhigg/',
});
