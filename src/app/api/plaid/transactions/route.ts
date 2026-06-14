import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const userId = "local_user";

    const items = await db.plaidItem.findMany({ where: { userId } });

    for (const item of items) {
      const { data } = await plaidClient.transactionsSync({
        access_token: item.accessToken,
      });

      for (const t of data.added) {
        await db.transaction.upsert({
          where: { transactionId: t.transaction_id },
          update: {
            amount: t.amount,
            pending: t.pending ?? false,
          },
          create: {
            userId,
            accountId: t.account_id,
            transactionId: t.transaction_id,
            amount: t.amount,
            date: t.date,
            name: t.name,
            merchantName: t.merchant_name ?? null,
            category: t.category ? JSON.stringify(t.category) : null,
            primaryCategory: t.personal_finance_category?.primary ?? "Other",
            detailedCategory: t.personal_finance_category?.detailed ?? null,
            paymentChannel: t.payment_channel,
            pending: t.pending ?? false,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("transactions sync error:", error);
    return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 });
  }
}
