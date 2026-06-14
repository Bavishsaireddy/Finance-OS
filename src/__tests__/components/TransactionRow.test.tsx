import { render, screen } from "@testing-library/react";
import TransactionRow from "@/components/transactions/TransactionRow";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";

const expense = MOCK_TRANSACTIONS.find(t => t.amount > 0)!;
const income = MOCK_TRANSACTIONS.find(t => t.amount < 0)!;

describe("TransactionRow — expense", () => {
  beforeEach(() => render(<TransactionRow transaction={expense} />));

  it("renders merchant or name", () => {
    const label = expense.merchant_name || expense.name;
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders the category", () => {
    expect(screen.getByText(new RegExp(expense.primary_category))).toBeInTheDocument();
  });

  it("shows a minus sign for expenses", () => {
    expect(screen.getByText(/-/)).toBeInTheDocument();
  });
});

describe("TransactionRow — income", () => {
  beforeEach(() => render(<TransactionRow transaction={income} />));

  it("shows a plus sign for income", () => {
    expect(screen.getByText(/\+/)).toBeInTheDocument();
  });
});

describe("TransactionRow — pending", () => {
  it("shows pending badge when transaction is pending", () => {
    const pending = { ...expense, pending: true };
    render(<TransactionRow transaction={pending} />);
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });
});
