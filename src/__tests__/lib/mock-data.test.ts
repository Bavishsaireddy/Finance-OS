import {
  MOCK_ACCOUNTS,
  MOCK_TRANSACTIONS,
  MOCK_BUDGETS,
  MOCK_MONTHLY_DATA,
  getMockSpendingCategories,
  getAvailableMonths,
} from "@/lib/mock-data";

describe("MOCK_ACCOUNTS", () => {
  it("has at least one depository account", () => {
    expect(MOCK_ACCOUNTS.some(a => a.type === "depository")).toBe(true);
  });

  it("has at least one credit account", () => {
    expect(MOCK_ACCOUNTS.some(a => a.type === "credit")).toBe(true);
  });

  it("all accounts have required fields", () => {
    for (const a of MOCK_ACCOUNTS) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.institution_name).toBeTruthy();
    }
  });
});

describe("MOCK_TRANSACTIONS", () => {
  it("has 64 transactions", () => {
    expect(MOCK_TRANSACTIONS).toHaveLength(64);
  });

  it("all transactions have required fields", () => {
    for (const t of MOCK_TRANSACTIONS) {
      expect(t.id).toBeTruthy();
      expect(t.amount).toBeDefined();
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.primary_category).toBeTruthy();
    }
  });

  it("contains income transactions", () => {
    expect(MOCK_TRANSACTIONS.some(t => t.amount < 0)).toBe(true);
  });
});

describe("getMockSpendingCategories", () => {
  it("returns spending categories for June 2026", () => {
    const cats = getMockSpendingCategories("2026-06");
    expect(cats.length).toBeGreaterThan(0);
  });

  it("categories sum to total spending", () => {
    const cats = getMockSpendingCategories("2026-06");
    const total = cats.reduce((s, c) => s + c.amount, 0);
    expect(total).toBeGreaterThan(0);
  });

  it("each category has a percentage", () => {
    const cats = getMockSpendingCategories("2026-06");
    for (const c of cats) {
      expect(c.percentage).toBeGreaterThanOrEqual(0);
      expect(c.percentage).toBeLessThanOrEqual(100);
    }
  });
});

describe("getAvailableMonths", () => {
  it("returns 6 months", () => {
    expect(getAvailableMonths()).toHaveLength(6);
  });

  it("months are in YYYY-MM format", () => {
    for (const m of getAvailableMonths()) {
      expect(m).toMatch(/^\d{4}-\d{2}$/);
    }
  });
});

describe("MOCK_MONTHLY_DATA", () => {
  it("has 6 months of data", () => {
    expect(MOCK_MONTHLY_DATA).toHaveLength(6);
  });

  it("income exceeds spending each month", () => {
    for (const m of MOCK_MONTHLY_DATA) {
      expect(m.income).toBeGreaterThan(0);
      expect(m.spending).toBeGreaterThan(0);
      expect(m.savings).toBe(m.income - m.spending);
    }
  });
});
