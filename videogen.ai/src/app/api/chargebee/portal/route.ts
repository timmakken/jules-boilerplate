import { NextRequest, NextResponse } from 'next/server';
import chargebee from 'chargebee-typescript';

chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd get the customer_id from the authenticated user's session/database record
    // This customer_id is Chargebee's ID for the customer, which you should store
    // when a subscription is successfully created or a customer record is made.
    const { customerId } = await request.json(); // For now, assume frontend sends this.

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required to create a portal session.' }, { status: 400 });
    }

    // Optional: Define redirect URL after logout from portal or other actions
    // const portalParams = {
    //   customer: {
    //     id: customerId,
    //   },
    //   redirect_url: process.env.NEXT_PUBLIC_APP_URL + '/account', // Redirect back to account page
    //   // forward_url: 'If you want to forward query params from original request to redirect_url'
    // };

    // @ts-ignore
    const result = await chargebee.portal_session.create({ customer: { id: customerId } }).request();
    const portalSession = result.portal_session;

    if (!portalSession || !portalSession.access_url) {
      return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
    }

    return NextResponse.json({ portalUrl: portalSession.access_url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    // @ts-ignore
    const errorMessage = error.message || 'Failed to create portal session';
    // @ts-ignore
    const statusCode = error.http_status_code || 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
