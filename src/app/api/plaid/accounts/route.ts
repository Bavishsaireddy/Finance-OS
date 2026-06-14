import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = "local_user";

    const rows = await db.account.findMany({
      where: { userId },
      orderBy: { type: "asc" },
    });

    const accounts = rows.map(a => ({
      id: a.id,
      userId: a.userId,
      itemId: a.itemId,
      accountId: a.accountId,
      name: a.name,
      type: a.type,
      subtype: a.subtype ?? "",
      mask: a.mask,
      current_balance: a.currentBalance,
      available_balance: a.availableBalance,
      credit_limit: a.creditLimit,
      institution_name: a.institutionName,
      institutionName: a.institutionName,
      institution_color: a.institutionColor,
      institutionColor: a.institutionColor,
      institutionLogo: a.institutionLogo,
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}
