import { NextRequest, NextResponse } from 'next/server';
import chargebee from 'chargebee-typescript';

// Configure Chargebee with your site name and API key
chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

export async function GET(request: NextRequest) {
  try {
    const result = await chargebee.item_price.list({
      limit: 10, // Adjust limit as needed
      "status[is]": "active", // Fetch only active plans
      "item_type[is]": "plan", // Ensure we are fetching plans
    }).request();

    const plans = result.list.map((entry) => entry.item_price);

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans from Chargebee:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}
