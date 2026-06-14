import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = "local_user";
    const { searchParams } = new URL(req.url);
    const onlyManual = searchParams.get("manual") === "true";

    const rows = await db.transaction.findMany({
      where: { userId, ...(onlyManual ? { isManual: true } : {}) },
      orderBy: { date: "desc" },
    });

    const transactions = rows.map(t => ({
      id: t.id,
      userId: t.userId,
      accountId: t.accountId,
      transactionId: t.transactionId,
      amount: t.amount,
      date: t.date,
      name: t.name,
      merchant_name: t.merchantName,
      primary_category: t.primaryCategory,
      payment_channel: t.paymentChannel,
      pending: t.pending,
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = "local_user";
    const body = await req.json();
    const { amount, date, name, merchantName, primaryCategory, paymentChannel, accountId, notes } = body;

    if (!amount || !date || !name) {
      return NextResponse.json({ error: "amount, date, and name are required" }, { status: 400 });
    }

    const row = await db.transaction.create({
      data: {
        userId,
        accountId: accountId || "manual",
        transactionId: `manual_${userId}_${Date.now()}`,
        amount: parseFloat(amount),
        date,
        name,
        merchantName: merchantName || null,
        category: JSON.stringify([primaryCategory || "Other"]),
        primaryCategory: primaryCategory || "Other",
        detailedCategory: primaryCategory || "Other",
        paymentChannel: paymentChannel || "other",
        pending: false,
        isManual: true,
        notes: notes || null,
      },
    });

    const transaction = {
      id: row.id,
      userId: row.userId,
      accountId: row.accountId,
      transactionId: row.transactionId,
      amount: row.amount,
      date: row.date,
      name: row.name,
      merchant_name: row.merchantName,
      primary_category: row.primaryCategory,
      payment_channel: row.paymentChannel,
      pending: row.pending,
    };

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = "local_user";
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await db.transaction.deleteMany({ where: { id, userId, isManual: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
