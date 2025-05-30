import { NextRequest, NextResponse } from 'next/server';
import chargebee from 'chargebee-typescript';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma'; // Import Prisma client

chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

const WEBHOOK_USERNAME = process.env.CHARGEBEE_WEBHOOK_USERNAME;
const WEBHOOK_PASSWORD = process.env.CHARGEBEE_WEBHOOK_PASSWORD;

export async function POST(request: NextRequest) {
  // 1. Authenticate Webhook (Basic Auth - already implemented)
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

  try {
    const event = await request.json();
    console.log('Received Chargebee webhook event:', JSON.stringify(event.event_type, null, 2));

    const { event_type, content } = event;
    const customer = content?.customer;
    const subscription = content?.subscription;
    const invoice = content?.invoice;

    // 2. Process Events
    switch (event_type) {
      case 'subscription_created':
      case 'subscription_activated': // Often occurs when trial ends and subscription becomes active
        if (customer && subscription) {
          // Assumption: customer.id from Chargebee IS your application's internal user.id
          // This was set during checkout: customer: { id: userId (from session) }
          const appUserId = customer.id;
          // const userEmail = customer.email; // Email is also useful for lookup/verification

          try {
            const updatedUser = await prisma.user.update({
              where: { id: appUserId }, // Find user by their internal ID
              data: {
                chargebeeCustomerId: appUserId, // Store our internal ID here to confirm link
                // You might want to add more fields like:
                // subscriptionStatus: 'active',
                // currentPlanId: subscription.plan_id,
                // subscriptionId: subscription.id, // Store Chargebee's subscription ID
              },
            });
            console.log(`Updated user ${updatedUser.email} with Chargebee Customer ID ${appUserId} and active subscription.`);
          } catch (dbError) {
            console.error(`Failed to update user ${appUserId} for event ${event_type}:`, dbError);
            // Potentially retry or log for manual intervention
          }
        } else {
            console.warn(`Webhook ${event_type} received without full customer or subscription data.`);
        }
        break;

      case 'subscription_changed': // e.g. upgrade/downgrade
         if (customer && subscription) {
            const chargebeeCustId = customer.id; // This is our appUserId
            try {
                const user = await prisma.user.findUnique({ where: { chargebeeCustomerId: chargebeeCustId }});
                if (user) {
                    // await prisma.user.update({
                    //     where: { id: user.id },
                    //     data: { currentPlanId: subscription.plan_id }
                    // });
                    console.log(`Subscription changed for user ${user.email}. New plan: ${subscription.plan_id}`);
                } else {
                     console.warn(`User not found for chargebeeCustomerId ${chargebeeCustId} during ${event_type}`);
                }
            } catch (dbError) {
                console.error(`Database error processing ${event_type} for ${chargebeeCustId}:`, dbError);
            }
         }
        break;

      case 'subscription_cancelled':
      case 'subscription_deleted':
        if (customer && subscription) {
          const chargebeeCustId = customer.id; // This is our appUserId
           try {
                const user = await prisma.user.findUnique({ where: { chargebeeCustomerId: chargebeeCustId }});
                if (user) {
                    // await prisma.user.update({
                    //     where: { id: user.id },
                    //     data: {
                    //         subscriptionStatus: 'cancelled',
                    //         // Optionally clear currentPlanId or chargebeeCustomerId if you want them to resubscribe cleanly
                    //         // chargebeeCustomerId: null, // Or keep it for history
                    //      }
                    // });
                    console.log(`Subscription ${subscription.status} for user ${user.email}.`);
                } else {
                     console.warn(`User not found for chargebeeCustomerId ${chargebeeCustId} during ${event_type}`);
                }
            } catch (dbError) {
                console.error(`Database error processing ${event_type} for ${chargebeeCustId}:`, dbError);
            }
        } else {
            console.warn(`Webhook ${event_type} received without full customer or subscription data.`);
        }
        break;

      // Optional: Handle payment success/failure if you need to track invoice statuses directly
      // case 'payment_succeeded':
      //   if (invoice && customer) {
      //     console.log(`Payment succeeded for invoice ${invoice.id}, customer ${customer.id}`);
      //     // Could update user record, e.g. lastPaymentDate
      //   }
      //   break;
      // case 'payment_failed':
      //   if (invoice && customer) {
      //     console.log(`Payment failed for invoice ${invoice.id}, customer ${customer.id}`);
      //     // Could trigger dunning emails or update user status
      //   }
      //   break;

      default:
        console.log('Unhandled Chargebee webhook event type:', event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling Chargebee webhook:', error);
    // @ts-ignore
    const errorMessage = error.message || 'Failed to process webhook';
    // @ts-ignore
    const statusCode = error.http_status_code || 500; // Chargebee might send HTTP status in error
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
