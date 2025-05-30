import { NextRequest, NextResponse } from 'next/server';
import chargebee from 'chargebee-typescript';

// Configure Chargebee with your site name and API key
chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Assuming the frontend will pass userId and userEmail if the user is authenticated
    const { planId, userId, userEmail } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    let customerInfo = {};
    if (userId && userEmail) {
      customerInfo = {
        customer: {
          id: userId, // User ID from your application's database
          email: userEmail, // User's email
          // You can add first_name, last_name etc. if available
        },
      };
    } else {
      // Handle cases where user is not fully identified, or it's an anonymous checkout.
      // Chargebee might create a guest customer or you might require login first.
      // For this example, we'll proceed without customer ID if not provided,
      // but in a real app, you'd likely enforce login or have a clear strategy.
      console.log("Proceeding with checkout without pre-filled customer ID/email. User might need to enter email on Chargebee's page.");
    }

    const hostedPageParams = {
      ...customerInfo, // Spread the customer object here
      subscription_items: [
        {
          item_price_id: planId,
        },
      ],
      // redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={hosted_page.id}`,
      // cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    };

    // @ts-ignore
    const result = await chargebee.hosted_page.checkout_new_for_items(hostedPageParams).request();
    const hostedPage = result.hosted_page;

    if (!hostedPage || !hostedPage.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: hostedPage.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    // @ts-ignore
    const errorMessage = error.message || 'Failed to create checkout session';
    // @ts-ignore
    const statusCode = error.http_status_code || 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
