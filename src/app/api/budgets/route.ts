import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = "local_user";

    const [budgets, transactions] = await Promise.all([
      db.budget.findMany({ where: { userId } }),
      db.transaction.findMany({ where: { userId } }),
    ]);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const result = budgets.map(b => {
      const spent = transactions
        .filter(t => t.primaryCategory === b.category && t.date.startsWith(currentMonth) && t.amount > 0)
        .reduce((s, t) => s + t.amount, 0);

      return {
        id: b.id,
        userId: b.userId,
        category: b.category,
        limit_amount: b.limitAmount,
        spent_amount: spent,
        period: b.period,
        icon: b.icon,
        color: b.color,
      };
    });

    return NextResponse.json({ budgets: result });
  } catch (error) {
    console.error("GET /api/budgets error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = "local_user";
    const { category, limitAmount } = await req.json();

    if (!category || !limitAmount) {
      return NextResponse.json({ error: "category and limitAmount are required" }, { status: 400 });
    }

    const budget = await db.budget.upsert({
      where: { userId_category: { userId, category } },
      update: { limitAmount: parseFloat(limitAmount) },
      create: {
        userId,
        category,
        limitAmount: parseFloat(limitAmount),
        icon: CATEGORY_ICONS[category] || "📦",
        color: CATEGORY_COLORS[category] || "#334155",
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error("POST /api/budgets error:", error);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = "local_user";
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await db.budget.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/budgets error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
