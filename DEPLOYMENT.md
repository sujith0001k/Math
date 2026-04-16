# Deploying MathApp to GitHub Pages

Deploying a Vite application to GitHub Pages is completely free. Follow these steps to host your `MathApp` online so that you can access it anytime via a web url.

## Step 1: Create a Repository on GitHub
1. Go to [GitHub](https://github.com/) and log in (or create an account).
2. Click the **+** icon in the top-right corner and select **New repository**.
3. Name the repository something like `math-worksheet-generator`.
4. Make it **Public**.
5. Do *not* initialize it with a README, `.gitignore`, or license.
6. Click **Create repository**.

## Step 2: Push Your Local Code to GitHub
Open your terminal (Command Prompt or PowerShell) and run the following commands to link your local code to your new GitHub repository.

```bash
cd C:\swapps\Antigravity\MathApp
git init
git add .
git commit -m "Initial commit of MathApp"
git branch -M main
```

Next, copy the remote repository URL from GitHub (it looks like `https://github.com/YourUsername/math-worksheet-generator.git`) and run:

```bash
git remote add origin YOUR_GITHUB_URL_HERE
git push -u origin main
```

## Step 3: Configure Vite for GitHub Pages
By default, Vite expects your app to be hosted at the root of a domain (like `mysite.com`). Since GitHub Pages hosts your app in a subpath (like `yourusername.github.io/math-worksheet-generator`), we need to configure Vite.

1. Open a new file in `C:\swapps\Antigravity\MathApp` named `vite.config.js`.
2. Add this exact code:

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  // REPLACE this with your actual repository name!
  base: '/math-worksheet-generator/',
})
```

3. Commit and push this change:
```bash
git add vite.config.js
git commit -m "Configure base path for GitHub Pages"
git push
```

## Step 4: Set Up GitHub Actions for Deployment
GitHub Actions can automatically build and deploy your Vite app whenever you push new code!

1. Go to your repository on GitHub.
2. Click on the **Settings** tab.
3. On the left sidebar, click **Pages**.
4. Under "Build and deployment", change the Source dropdown from "Deploy from a branch" to **GitHub Actions**.

Now, create the deployment script:
1. In your local `MathApp` folder, create a directory structure: `.github/workflows/deploy.yml`.
2. Open `deploy.yml` and paste the following configuration:

```yaml
# .github/workflows/deploy.yml
name: Deploy static content to Pages

on:
  push:
    branches: ['main']

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. Push the GitHub Action up to triggering your first automated deployment:
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push
```

## Step 5: View Your Live App!
1. Go back to your GitHub repository and click on the **Actions** tab.
2. You will see your deployment workflow running. Wait for it to turn into a green checkmark ✅.
3. Go back to your repository's **Settings -> Pages**.
4. You will see a banner at the top that says "Your site is live at `https://yourusername.github.io/math-worksheet-generator/`". 

Click that link, and your MathApp is fully online and ready for you to download PDFs on demand! Every time you `git push` new changes, it will automatically update online.
