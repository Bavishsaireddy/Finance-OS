import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { Products, CountryCode } from "plaid";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const userId = "local_user";

    const { data } = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "FinanceOS",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return NextResponse.json({ link_token: data.link_token });
  } catch (error) {
    console.error("create-link-token error:", error);
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
  }
}
