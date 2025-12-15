# Nigeria Tax Calculator Frontend

A modern, intuitive React frontend for the Nigeria Tax Act 2025 Calculator.

## Features

- 🧮 **Tax Calculator** - Calculate personal income tax with detailed breakdown
- 📄 **Bank Statement Analysis** - Upload PDF/CSV statements for automatic transaction detection
- 🤖 **AI Tax Advisor** - Chat with AI for instant tax advice
- ⚙️ **Configuration Viewer** - View current tax rates and settings
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - API client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Backend API running on `http://localhost:3000`

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env if your backend is on a different port
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
tax-app-frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navigation
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Calculator.jsx      # Tax calculator
│   │   ├── BankStatement.jsx   # Statement upload & analysis
│   │   ├── AIChat.jsx          # AI chat interface
│   │   └── Config.jsx          # Configuration viewer
│   ├── services/
│   │   └── api.js              # API client
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Features Overview

### Tax Calculator
- Add multiple income sources (salary, business, investment, etc.)
- Enter deductions (pension, NHF, NHIS, rent, life assurance)
- View detailed tax breakdown by band
- See net income after tax

### Bank Statement Analysis
- Upload PDF or CSV bank statements
- AI-powered transaction extraction
- Automatic categorization of income and deductions
- Digital asset detection with ring-fencing warnings
- Instant tax calculation from detected data

### AI Tax Advisor
- Chat interface for tax questions
- Answers based on Nigeria Tax Act 2025
- Quick question suggestions
- Real-time responses

### Configuration Viewer
- View current tax bands and rates
- See reliefs and deduction caps
- Check configuration source (database or fallback)
- Refresh to get latest rates

## API Integration

The frontend communicates with the backend API at `/api`. Make sure your backend is running and accessible.

Default API URL: `http://localhost:3000/api`

To change this, update `VITE_API_URL` in your `.env` file.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

- Uses functional components with hooks
- Tailwind CSS for styling
- Responsive design with mobile-first approach
- Error handling with toast notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

