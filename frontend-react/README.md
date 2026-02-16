# React Frontend - Emotion-Aware Wellbeing Assistant

Modern React frontend with smooth animations, light/dark mode, and enhanced dashboard.

## Features

- ✨ **Smooth Animations**: Powered by Framer Motion
- 🌓 **Light/Dark Mode**: Toggle between themes with persistent storage
- 📊 **Interactive Charts**: Recharts for beautiful data visualization
- 🎨 **Modern UI**: Glassmorphism design with gradient accents
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- ⚡ **Fast**: Built with Vite for instant HMR

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Lightning-fast build tool
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Composable charting library
- **Axios**: HTTP client for API calls
- **Lucide React**: Beautiful icon library

## Installation

```bash
cd frontend-react
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend-react/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Main dashboard with analysis
│   │   ├── Dashboard.css
│   │   ├── TestingLabs.jsx     # Testing samples
│   │   └── TestingLabs.css
│   ├── App.jsx                 # Main app with routing
│   ├── App.css                 # Global styles
│   ├── main.jsx                # Entry point
│   └── index.css               # Reset styles
├── index.html
├── package.json
└── vite.config.js
```

## API Configuration

The frontend connects to the FastAPI backend at `http://127.0.0.1:8000`.

To change this, update the `BACKEND_URL` constant in `src/components/Dashboard.jsx`.

## Theme System

The app supports light and dark themes:
- Theme preference is saved to localStorage
- Toggle using the button in the sidebar
- CSS variables automatically update

## Components

### Dashboard
- Multi-modal input (text, audio, image)
- Real-time emotion analysis
- Animated charts (Radar, Bar, Line)
- Session history tracking

### Testing Labs
- Sample text prompts
- Audio file links
- Visual testing guidelines
- Quick start guide

## Animations

All animations use Framer Motion:
- Page transitions
- Card hover effects
- Button interactions
- Staggered list animations

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
