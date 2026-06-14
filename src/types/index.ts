export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  transactionId: string;
  amount: number;
  date: string;
  name: string;
  merchant_name: string | null;
  primary_category: string;
  payment_channel: string;
  pending: boolean;
}

export interface Account {
  id: string;
  userId: string;
  itemId: string;
  accountId: string;
  name: string;
  type: string;
  subtype: string;
  mask: string;
  current_balance: number;
  available_balance: number | null;
  credit_limit: number | null;
  institution_name: string;
  institutionName: string;
  institution_color: string;
  institutionColor: string;
  institutionLogo: string | null;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  period: string;
  icon: string;
  color: string;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  change: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  spending: number;
  savings: number;
}
