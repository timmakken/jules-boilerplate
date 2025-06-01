import { NextRequest, NextResponse } from 'next/server';
import { getChargebee } from '@/lib/chargebee';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // @ts-ignore session.user.id might not be on default User type. It's added via callbacks.
    const userId = session.user.id as string;
    const userEmail = session.user.email as string;

    if (!userId) {
      return NextResponse.json({ error: 'User ID missing in session' }, { status: 400 });
    }

    console.log('Fetching subscription status for user:', { userId, userEmail });

    const chargebee = getChargebee();
    
    // Log available methods on chargebee to debug
    console.log('Available methods on chargebee:', Object.keys(chargebee));
    
    // Try multiple methods to find subscriptions for the user
    try {
      console.log('Trying subscription.list with customer_id...');
      
      // Use type assertion to bypass TypeScript's property checking
      const params = {
        "customer_id[is]": userId,
        "status[in]": ["active", "in_trial", "non_renewing", "cancelled", "future"]
      } as any;
      
      // @ts-ignore - Ignore TypeScript errors for now as we're adapting to Chargebee v3
      const result = await chargebee.subscription.list(params);
      
      console.log('Subscription list response received');
      
      if (!result.list || !Array.isArray(result.list)) {
        console.log('No subscriptions found or invalid response structure');
        return NextResponse.json({ 
          status: 'not_subscribed',
          message: 'Not yet subscribed or ID not found.'
        });
      }
      
      console.log(`Found ${result.list.length} subscriptions`);
      
      if (result.list.length === 0) {
        return NextResponse.json({ 
          status: 'not_subscribed',
          message: 'Not yet subscribed or ID not found.'
        });
      }
      
      // Get the most recent subscription
      const subscriptions = result.list.map((entry: any) => {
        const subscription = entry.subscription;
        return {
          id: subscription.id,
          planId: subscription.plan_id,
          status: subscription.status,
          currentTermStart: subscription.current_term_start,
          currentTermEnd: subscription.current_term_end,
          createdAt: subscription.created_at,
          updatedAt: subscription.updated_at,
          customerEmail: subscription.customer_email || userEmail,
        };
      });
      
      // Sort by created_at in descending order to get the most recent subscription
      subscriptions.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      const latestSubscription = subscriptions[0];
      
      // Format the status message
      let statusMessage = '';
      switch (latestSubscription.status) {
        case 'active':
          statusMessage = 'Active subscription';
          break;
        case 'in_trial':
          statusMessage = 'Trial subscription';
          break;
        case 'non_renewing':
          statusMessage = 'Subscription will not renew';
          break;
        case 'cancelled':
          statusMessage = 'Subscription cancelled';
          break;
        case 'future':
          statusMessage = 'Subscription scheduled to start in the future';
          break;
        default:
          statusMessage = `Subscription status: ${latestSubscription.status}`;
      }
      
      return NextResponse.json({
        status: latestSubscription.status,
        message: statusMessage,
        subscription: latestSubscription
      });
    } catch (subscriptionError) {
      console.error('Error using subscription.list:', subscriptionError);
      
      // Try alternative method
      try {
        console.log('Trying customer.retrieve to get subscriptions...');
        // @ts-ignore
        const customerResult = await chargebee.customer.retrieve(userId);
        
        if (!customerResult || !customerResult.customer) {
          console.log('Customer not found');
          return NextResponse.json({ 
            status: 'not_subscribed',
            message: 'Not yet subscribed or ID not found.'
          });
        }
        
        console.log('Customer found, fetching subscriptions...');
        
        // Use type assertion to bypass TypeScript's property checking
        const subscriptionParams = {
          "customer_id[is]": customerResult.customer.id
        } as any;
        
        // @ts-ignore
        const subscriptionsResult = await chargebee.subscription.list(subscriptionParams);
        
        if (!subscriptionsResult.list || !Array.isArray(subscriptionsResult.list) || subscriptionsResult.list.length === 0) {
          console.log('No subscriptions found for customer');
          return NextResponse.json({ 
            status: 'not_subscribed',
            message: 'Not yet subscribed or ID not found.'
          });
        }
        
        // Process subscriptions as above
        const subscriptions = subscriptionsResult.list.map((entry: any) => {
          const subscription = entry.subscription;
          return {
            id: subscription.id,
            planId: subscription.plan_id,
            status: subscription.status,
            currentTermStart: subscription.current_term_start,
            currentTermEnd: subscription.current_term_end,
            createdAt: subscription.created_at,
            updatedAt: subscription.updated_at,
            customerEmail: subscription.customer_email || userEmail,
          };
        });
        
        subscriptions.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        const latestSubscription = subscriptions[0];
        
        // Format the status message
        let statusMessage = '';
        switch (latestSubscription.status) {
          case 'active':
            statusMessage = 'Active subscription';
            break;
          case 'in_trial':
            statusMessage = 'Trial subscription';
            break;
          case 'non_renewing':
            statusMessage = 'Subscription will not renew';
            break;
          case 'cancelled':
            statusMessage = 'Subscription cancelled';
            break;
          case 'future':
            statusMessage = 'Subscription scheduled to start in the future';
            break;
          default:
            statusMessage = `Subscription status: ${latestSubscription.status}`;
        }
        
        return NextResponse.json({
          status: latestSubscription.status,
          message: statusMessage,
          subscription: latestSubscription
        });
      } catch (customerError) {
        console.error('Error retrieving customer or subscriptions:', customerError);
        return NextResponse.json({ 
          status: 'not_subscribed',
          message: 'Not yet subscribed or ID not found. If you recently subscribed, your Chargebee Customer ID might still be syncing.'
        });
      }
    }
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    // @ts-ignore
    const errorMessage = error.message || 'Failed to fetch subscription status';
    return NextResponse.json({ 
      status: 'error',
      message: 'Error fetching subscription status. Please try again later.',
      error: errorMessage 
    }, { status: 500 });
  }
}
