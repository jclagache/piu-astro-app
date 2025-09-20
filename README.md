# PIU dApp - Decentralized Application on Solana

A modern Web3 application built around the $PIU token deployed on the Solana blockchain. Connect your wallet, check your balance, and access exclusive features reserved for token holders.

## 🚀 Features

- **Wallet Connection**: Seamless integration with Solana wallets (Phantom, Solflare)
- **Token Verification**: Automatic $PIU balance checking and conditional access
- **Exclusive Content**: Premium features for token holders
- **Content Generator**: Create and customize unique content
- **Modern UI**: Built with Astro, Tailwind CSS, and Shadcn UI components
- **Dark Mode**: Native theme switching support

## 🏗️ Built With

- [Astro](https://astro.build/) - Web framework for content-focused websites
- [React](https://reactjs.org/) - For interactive components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Modern component library
- [Reown AppKit](https://reown.com/) - Web3 wallet connection
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) - Solana blockchain interaction

## 🛠️ Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd piu-astro-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Reown AppKit Project ID (get yours at https://cloud.reown.com/)
PUBLIC_REOWN_PROJECT_ID=your_reown_project_id

# Solana RPC endpoint
PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**Note**: This project uses `PUBLIC_REOWN_PROJECT_ID` (not `NEXT_PUBLIC_PROJECT_ID`) as it's built with Astro, not Next.js.

## 📦 Token Information

- **Token Symbol**: $PIU
- **Blockchain**: Solana
- **Contract Address**: `5eafqp6ic7WpxUsKJLhnLxthUcEYatjhXPNLBRZCpump`

## 🌐 Deployment on Cloudflare Pages

This application is configured for deployment on [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/).

### Deploy via Cloudflare Dashboard

1. Push your code to a GitHub repository
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### Deploy via CLI

```bash
# Install Cloudflare CLI
npm install -g @cloudflare/cli

# Login to Cloudflare
npx wrangler login

# Deploy your site
npx wrangler pages deploy dist
```

### Build Configuration

The app is configured with the Cloudflare adapter in `astro.config.mjs`:

```js
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  // ... other config
});
```

## 📁 Selective Deployment

The application uses a simple approach to separate production pages from development pages:

### **Production pages** :
- ✅ `src/pages/index.astro` - Home page
- ✅ `src/pages/wallet.astro` - Wallet connection
- ✅ `src/pages/exclusive-holders-content.astro` - Exclusive content
- ✅ `src/pages/content-generator.astro` - Content generator

### **Development-only pages** :
- 🛠️ `src/pages/dev/colors.astro` - PIU color palette
- 🛠️ `src/pages/dev/demo.astro` - Interactive demos
- 🛠️ `src/pages/dev/shadcn.astro` - Shadcn UI components
- 🛠️ `src/pages/dev/markdown-page.astro` - Markdown rendering test

### **How it works** :
1. **In development** (`npm run dev`) : All pages accessible via `/dev/*`
2. **In production** (`npm run build`) : The `src/pages/dev/` folder is automatically excluded from build via `.gitignore`
3. **Adaptive navigation** : Development links only show in development mode

### **Advantages of this approach** :
- ✅ **Simple** : No custom deployment script
- ✅ **Automatic** : Automatic exclusion via `.gitignore`
- ✅ **Maintainable** : Clear and organized structure
- ✅ **Flexible** : Easy to add/remove development pages

## 🔧 Scripts

- `npm run dev` - Start development server (all pages accessible via `/dev/*`)
- `npm run build` - Build for production (development pages automatically excluded)
- `npm run preview` - Preview production build locally

## 📝 Project Structure

```
src/
├── components/          # Astro and React components
│   ├── react/          # React components
│   └── ui/             # Shadcn UI components
├── hooks/              # React hooks for Web3 integration
├── layouts/            # Astro layouts
├── pages/              # Astro pages (file-based routing)
├── styles/             # Global CSS and theme configuration
└── utils/              # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
