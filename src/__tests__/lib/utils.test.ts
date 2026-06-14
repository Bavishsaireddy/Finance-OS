import { formatCurrency, formatDate, formatDateShort, cn, getChangeColor, getChangeLabel } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-500)).toBe("-$500.00");
  });

  it("compact format rounds large values", () => {
    const result = formatCurrency(2500, true);
    expect(result).toMatch(/\$2\.5k/i);
  });

  it("compact skips k for small values", () => {
    expect(formatCurrency(500, true)).toBe("$500.00");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2026-06-15");
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2026/);
  });

  it("does not shift date due to UTC offset", () => {
    const result = formatDate("2026-01-01");
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/1/);
  });
});

describe("formatDateShort", () => {
  it("omits the year", () => {
    const result = formatDateShort("2026-03-20");
    expect(result).toMatch(/Mar/);
    expect(result).not.toMatch(/2026/);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false && "bar", undefined)).toBe("foo");
  });
});

describe("getChangeColor", () => {
  it("returns danger color for positive change (spending up is bad)", () => {
    expect(getChangeColor(5)).toBe("text-danger-DEFAULT");
  });

  it("returns success color for negative change", () => {
    expect(getChangeColor(-5)).toBe("text-success-DEFAULT");
  });

  it("returns secondary for zero change", () => {
    expect(getChangeColor(0)).toBe("text-text-secondary");
  });
});

describe("getChangeLabel", () => {
  it("includes a + prefix for positive changes", () => {
    expect(getChangeLabel(3.5)).toBe("+3.5%");
  });

  it("does not add + for negative changes", () => {
    expect(getChangeLabel(-2.1)).toBe("-2.1%");
  });
});
