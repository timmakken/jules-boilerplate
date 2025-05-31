import { NextRequest, NextResponse } from 'next/server';
import chargebee from 'chargebee-typescript';
import { headers } from 'next/headers';

// Configure Chargebee with your site name and API key
chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

// It's recommended to store your webhook endpoint's basic auth username and password
// as environment variables for security.
// These are configured in Chargebee's webhook settings.
const WEBHOOK_USERNAME = process.env.CHARGEBEE_WEBHOOK_USERNAME;
const WEBHOOK_PASSWORD = process.env.CHARGEBEE_WEBHOOK_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (WEBHOOK_USERNAME && WEBHOOK_PASSWORD) {
      if (!authorization) {
        return NextResponse.json({ error: 'Webhook authorization required.' }, { status: 401 });
      }
      const encodedCreds = Buffer.from(`${WEBHOOK_USERNAME}:${WEBHOOK_PASSWORD}`).toString('base64');
      if (authorization !== `Basic ${encodedCreds}`) {
        return NextResponse.json({ error: 'Invalid webhook credentials.' }, { status: 403 });
      }
    }

    const event = await request.json();

    // TODO: It's good practice to verify the event source if Chargebee provides a mechanism
    // (e.g., signature verification), though chargebee-typescript might handle some aspects.

    console.log('Received Chargebee webhook event:', JSON.stringify(event, null, 2));

    // Process the event based on its type
    switch (event.event_type) {
      case 'subscription_created':
        // Handle new subscription
        // e.g., update user's subscription status in your database
        console.log('Subscription created:', event.content.subscription.id);
        break;
      case 'subscription_changed':
      case 'subscription_renewed':
      case 'subscription_activated': // Occurs when a trial ends and subscription becomes active
        // Handle subscription update
        // e.g., update user's subscription plan or status
        console.log('Subscription changed/renewed/activated:', event.content.subscription.id);
        break;
      case 'subscription_cancelled':
      case 'subscription_deleted': // Similar to cancelled, but occurs immediately without term-end consideration for some cases
        // Handle subscription cancellation
        // e.g., update user's subscription status, restrict access to premium features
        console.log('Subscription cancelled/deleted:', event.content.subscription.id);
        break;
      case 'payment_succeeded':
        // Handle successful payment
        console.log('Payment succeeded for invoice:', event.content.invoice.id);
        break;
      case 'payment_failed':
        // Handle failed payment
        console.log('Payment failed for invoice:', event.content.invoice.id);
        break;
      // Add more event types as needed
      default:
        console.log('Unhandled Chargebee webhook event type:', event.event_type);
    }

    // Acknowledge receipt of the event to Chargebee
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling Chargebee webhook:', error);
    // @ts-ignore
    const errorMessage = error.message || 'Failed to process webhook';
    // @ts-ignore
    const statusCode = error.http_status_code || 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
