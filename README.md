# MNF Modpack Wiki

A comprehensive database and documentation system for the Manfredonia Minecraft modpack.

<img width="1840" height="974" alt="immagine" src="https://github.com/user-attachments/assets/62624106-5c53-434b-84ca-7f11464b5d2f" />

## Features

- **📊 Mod Database**: Complete catalog of 226+ mods with categories, descriptions, and links
- **🔍 Search & Filter**: Find mods quickly by name, category, or description
- **📱 Responsive Design**: Optimized for both desktop and mobile devices
- **🎨 Modern UI**: Clean, futuristic interface with dark theme
- **⚡ Performance Optimized**: Fast loading and smooth interactions
- **🚀 Ready for Deployment**: Pre-configured for Netlify hosting

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Netlify ready

## Quick Start

**Prerequisites:** Node.js 18+

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ciobert345/manfredonia-modpack-wiki.git
   cd manfredonia-modpack-wiki
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Netlify (Recommended)

1. **Push to GitHub** (already done!)
2. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select the `manfredonia-modpack-wiki` repository
3. **Deploy settings:**
   - Netlify will automatically detect the `netlify.toml` configuration
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy!** 🚀

The site will be automatically built and deployed with every push to the master branch.

### Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider.

## Project Structure

```
├── data/
│   └── modData.ts          # Mod database and categories
├── components/
│   └── ModCard.tsx         # UI component for mod cards
├── public/
│   └── icon.png           # Site favicon
├── src/
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # Application entry point
│   └── types.ts           # TypeScript type definitions
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── netlify.toml          # Netlify deployment configuration
└── vite.config.ts        # Vite build configuration
```

## Mod Categories

- **🚀 Optimization**: Performance-enhancing mods
- **🌍 Dimensions**: New dimensions and realms
- **🏗️ Structures**: Buildings and dungeons
- **⚔️ Combat**: Combat enhancements and weapons
- **🎭 RPG**: Role-playing game elements
- **👁️ Visual**: Graphics and visual improvements
- **⚙️ Tech**: Technology and automation
- **🌾 Farming**: Agriculture and food
- **🔧 Utility**: Quality of life improvements
- **📦 Storage**: Inventory and storage solutions
- **📚 Library**: Core dependencies and APIs

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly: `npm run dev`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/Ciobert345/manfredonia-modpack-wiki/issues).

---

**Built with ❤️ for the Manfredonia Minecraft Community**
