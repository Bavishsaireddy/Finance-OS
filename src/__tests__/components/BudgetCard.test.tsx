import { render, screen } from "@testing-library/react";
import BudgetCard from "@/components/budget/BudgetCard";
import { MOCK_BUDGETS } from "@/lib/mock-data";

const underBudget = MOCK_BUDGETS.find(b => b.spent_amount < b.limit_amount)!;
const overBudget = MOCK_BUDGETS.find(b => b.spent_amount > b.limit_amount)!;

describe("BudgetCard — under budget", () => {
  beforeEach(() => render(<BudgetCard budget={underBudget} />));

  it("renders the category name", () => {
    expect(screen.getByText(underBudget.category)).toBeInTheDocument();
  });

  it("renders the budget icon", () => {
    expect(screen.getByText(underBudget.icon)).toBeInTheDocument();
  });

  it("shows remaining amount", () => {
    expect(screen.getByText(/left/i)).toBeInTheDocument();
  });
});

describe("BudgetCard — over budget", () => {
  beforeEach(() => render(<BudgetCard budget={overBudget} />));

  it("renders the category name", () => {
    expect(screen.getByText(overBudget.category)).toBeInTheDocument();
  });

  it("shows over amount", () => {
    expect(screen.getByText(/over/i)).toBeInTheDocument();
  });
});
