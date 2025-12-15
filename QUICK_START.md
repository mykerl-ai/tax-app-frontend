# Quick Start Guide

## Installation

1. **Navigate to frontend directory:**
```bash
cd tax-app-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173`

## Prerequisites

Make sure your backend is running on `http://localhost:3000` before using the frontend.

To start the backend:
```bash
cd ../tax-app-backend
npm run dev
```

## Features to Try

### 1. Tax Calculator
- Go to `/calculator`
- Add income sources (salary, business, etc.)
- Enter deductions (pension, rent, etc.)
- Click "Calculate Tax" to see detailed breakdown

### 2. Bank Statement Analysis
- Go to `/bank-statement`
- Upload a PDF or CSV bank statement
- View automatically detected income and deductions
- See instant tax calculation

### 3. AI Tax Advisor
- Go to `/ai-chat`
- Ask questions about Nigeria Tax Act 2025
- Get instant, accurate answers with citations

### 4. Configuration Viewer
- Go to `/config`
- View current tax rates and bands
- See reliefs and deduction caps
- Check if using database or fallback config

## Troubleshooting

### "Failed to fetch" errors
- Make sure backend is running on port 3000
- Check `VITE_API_URL` in `.env` file

### Styling looks broken
- Run `npm install` to ensure Tailwind CSS is set up
- Clear browser cache

### Port 5173 already in use
- Change port in `vite.config.js` or kill the process using port 5173

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready to deploy to any static hosting service.

