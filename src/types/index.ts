export type AppMode = 'personal' | 'business'

export interface Profile {
  id: string
  full_name: string
  cpf: string | null
  phone: string | null
  avatar_url: string | null
  has_company: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  user_id: string
  name: string
  cnpj: string | null
  segment: string | null
  city: string | null
  state: string | null
  opened_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  mode: AppMode
  icon: string | null
  color: string | null
  created_at: string
}

export interface Income {
  id: string
  user_id: string
  company_id: string | null
  name: string
  value: number
  date: string
  category_id: string | null
  category?: Category
  observation: string | null
  mode: AppMode
  is_ifood: boolean
  created_at: string
  updated_at: string
  attachments?: Attachment[]
}

export interface Expense {
  id: string
  user_id: string
  company_id: string | null
  name: string
  value: number
  date: string
  category_id: string | null
  category?: Category
  description: string | null
  observation: string | null
  mode: AppMode
  created_at: string
  updated_at: string
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  expense_id?: string | null
  income_id?: string | null
  user_id: string
  file_url: string
  file_name: string
  file_type: string
  created_at: string
}

export interface RecurringExpense {
  id: string
  user_id: string
  name: string
  value: number
  category_id: string | null
  category?: Category
  frequency: 'monthly' | 'weekly' | 'yearly'
  start_date: string
  end_date: string | null
  mode: AppMode
  active: boolean
  created_at: string
}

export interface RecurringIncome {
  id: string
  user_id: string
  name: string
  value: number
  category_id: string | null
  category?: Category
  frequency: 'monthly' | 'weekly' | 'yearly'
  start_date: string
  end_date: string | null
  mode: AppMode
  active: boolean
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_amount: number
  current_amount: number
  deadline: string | null
  mode: AppMode
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  created_at: string
}

export interface Settings {
  id: string
  user_id: string
  dark_mode: boolean
  notifications_enabled: boolean
  language: string
}

export interface MonthlyReport {
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  netBalance: number
  topIncomeCategory: string | null
  topExpenseCategory: string | null
  incomeCount: number
  expenseCount: number
  roi: number
}

export interface AnnualSummary {
  year: number
  totalIncome: number
  totalExpenses: number
  futureExpenses: number
  futureIncome: number
  netProfit: number
  roi: number
  bestMonth: number
  worstMonth: number
  growthVsLastYear: number | null
  totalTransactions: number
  months: MonthlyReport[]
}
