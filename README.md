# D&A Gestão Financeira 💰

Plataforma completa de gestão financeira pessoal e empresarial.

## Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS** + Design System Apex Finance
- **Supabase** (Auth, Database, Storage)
- **React Query v5** — server state management
- **Zustand** — client state (mode, date)
- **React Hook Form** + **Zod** — forms & validation
- **Recharts** — charts & analytics
- **jsPDF** + **XLSX** — PDF & Excel export
- **PWA** — installable web app

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

If `npm` is not in PATH, use the helper script:
```powershell
.\dev.ps1 install
.\dev.ps1 dev
```

## Database Setup

1. Go to your [Supabase Project](https://oclebffxglupflmdkfxk.supabase.co)
2. Navigate to **SQL Editor**
3. Copy and run the full content of `supabase_schema.sql`

## Features

### Authentication
- Email + Password login
- Forgot password recovery
- Auto-profile creation on signup
- 2-step onboarding (personal + company)

### Personal Dashboard
- Monthly income/expense overview
- Smart financial alerts
- Cash flow chart (last 6 months)
- Category expense breakdown (donut)
- Goals progress tracking
- Recent activity feed

### Receitas (Income)
- Add, edit, delete income entries
- iFood integration (transfer number)
- Category selection
- Monthly filtering

### Despesas (Expenses)
- Add, edit, delete expense entries
- File attachment support (images, PDFs)
- Category selection
- Monthly filtering

### Metas (Goals)
- Create financial goals with icon, target, deadline
- Real-time progress tracking
- Personal and business modes

### Relatórios (Reports)
- Full annual report
- Month-by-month breakdown
- ROI calculation
- Best/worst month analysis
- **Export to PDF** (professional layout)
- **Export to Excel** (structured sheets)

### Perfil (Profile)
- Avatar upload
- Company mode toggle
- Notifications settings
- Export shortcuts

## Mode Switching
Toggle between **Pessoal** (Personal) and **Empresarial** (Business) modes.
All data (incomes, expenses, goals) is segregated by mode.

## PWA
The app is installable as a Progressive Web App. On mobile, tap "Add to Home Screen".
