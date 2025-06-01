import { NextRequest, NextResponse } from 'next/server';
import { getChargebee } from '@/lib/chargebee';
import { getServerSession } from 'next-auth/next'; // Import getServerSession
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

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

    console.log('User authenticated:', { userId, userEmail });

    const chargebee = getChargebee();
    
    // Log the parameters for debugging
    console.log('Creating checkout with parameters:', {
      userId,
      userEmail,
      planId
    });
    
    // Log available methods on chargebee to debug
    console.log('Available methods on chargebee:', Object.keys(chargebee));
    
    // Use the correct parameter structure for Chargebee v3 with product catalog version 2.0
    const checkoutParams = {
      subscription_items: [
        {
          item_price_id: planId,
          quantity: 1  // Add quantity parameter as required by Chargebee
        }
      ],
      customer: {
        id: userId,
        email: userEmail
      },
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
    };
    
    console.log('Checkout params:', JSON.stringify(checkoutParams, null, 2));
    
    // Try multiple method names to find the correct one
    try {
      console.log('Trying hostedPage.checkoutNewForItems...');
      // @ts-ignore - Ignore TypeScript errors for now as we're adapting to Chargebee v3
      const result = await chargebee.hostedPage.checkoutNewForItems(checkoutParams);
      console.log('Chargebee API response:', JSON.stringify(result, null, 2));
      
      // @ts-ignore - TypeScript might still expect hosted_page (snake_case)
      const hostedPage = result.hosted_page;
      
      if (!hostedPage || !hostedPage.url) {
        console.error('No hosted_page or URL in response:', result);
        throw new Error('No hosted_page or URL in response');
      }
      
      return NextResponse.json({ checkoutUrl: hostedPage.url });
    } catch (error1) {
      console.error('Error with hostedPage.checkoutNewForItems:', error1);
      
      try {
        console.log('Trying hosted_page.checkout_new_for_items...');
        // @ts-ignore
        const result = await chargebee.hosted_page.checkout_new_for_items(checkoutParams);
        console.log('Chargebee API response:', JSON.stringify(result, null, 2));
        
        // @ts-ignore
        const hostedPage = result.hosted_page;
        
        if (!hostedPage || !hostedPage.url) {
          console.error('No hosted_page or URL in response:', result);
          throw new Error('No hosted_page or URL in response');
        }
        
        return NextResponse.json({ checkoutUrl: hostedPage.url });
      } catch (error2) {
        console.error('Error with hosted_page.checkout_new_for_items:', error2);
        
        // Try with subscription.create_checkout
        try {
          console.log('Trying subscription.create_checkout...');
          
          // Different parameter structure for subscription.create_checkout
          const subscriptionParams = {
            plan_id: planId,
            customer: {
              id: userId,
              email: userEmail
            },
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
          };
          
          console.log('Subscription params:', JSON.stringify(subscriptionParams, null, 2));
          
          // @ts-ignore
          const result = await chargebee.subscription.create_checkout(subscriptionParams);
          console.log('Chargebee API response:', JSON.stringify(result, null, 2));
          
          // @ts-ignore
          const hostedPage = result.hosted_page;
          
          if (!hostedPage || !hostedPage.url) {
            console.error('No hosted_page or URL in response:', result);
            throw new Error('No hosted_page or URL in response');
          }
          
          return NextResponse.json({ checkoutUrl: hostedPage.url });
        } catch (error3) {
          console.error('Error with subscription.create_checkout:', error3);
          
          // Try one more method - hosted_page.checkout_new
          try {
            console.log('Trying hosted_page.checkout_new...');
            
            // Different parameter structure for hosted_page.checkout_new
            const legacyParams = {
              subscription: {
                plan_id: planId
              },
              customer: {
                id: userId,
                email: userEmail
              },
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
            };
            
            console.log('Legacy params:', JSON.stringify(legacyParams, null, 2));
            
            // @ts-ignore
            const result = await chargebee.hosted_page.checkout_new(legacyParams);
            console.log('Chargebee API response:', JSON.stringify(result, null, 2));
            
            // @ts-ignore
            const hostedPage = result.hosted_page;
            
            if (!hostedPage || !hostedPage.url) {
              console.error('No hosted_page or URL in response:', result);
              throw new Error('No hosted_page or URL in response');
            }
            
            return NextResponse.json({ checkoutUrl: hostedPage.url });
          } catch (error4) {
            console.error('Error with hosted_page.checkout_new:', error4);
            throw new Error('All checkout methods failed');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkout route:', error);
    // @ts-ignore
    const errorMessage = error.message || 'Failed to process checkout request';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
