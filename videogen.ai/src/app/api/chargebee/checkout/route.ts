import { NextRequest, NextResponse } from 'next/server';
import chargebee from 'chargebee-typescript';
import { getServerSession } from 'next-auth/next'; // Import getServerSession
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { planId } = await request.json(); // userId and userEmail will come from session

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // @ts-ignore session.user.id might not be on default User type. It's added via callbacks.
    const userId = session.user.id as string;
    const userEmail = session.user.email as string;

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'User ID or Email missing in session' }, { status: 400 });
    }

    let customerInfo = {
      customer: {
        id: userId,
        email: userEmail,
        // Consider adding first_name, last_name if available in your User model and session
        // name: session.user.name || '',
      },
    };

    const hostedPageParams = {
      ...customerInfo,
      subscription_items: [
        { item_price_id: planId },
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
