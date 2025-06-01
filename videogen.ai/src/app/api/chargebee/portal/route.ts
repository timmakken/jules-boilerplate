import { NextRequest, NextResponse } from 'next/server';
import { getChargebee } from '@/lib/chargebee';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path
import prisma from '@/lib/prisma'; // Import Prisma client

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // @ts-ignore session.user.id should be string (it is, based on callbacks)
  if (!session || !session.user || !session.user.id || typeof session.user.id !== 'string') {
    return NextResponse.json({ error: 'Unauthorized or User ID missing/invalid' }, { status: 401 });
  }

  try {
    // @ts-ignore session.user.id is known to be a string here
    const userId: string = session.user.id;
    
    // Get customerId and subscriptionId from request body
    const { customerId, subscriptionId } = await request.json();
    
    console.log('Portal request params:', { customerId, subscriptionId, userId });
    
    // Determine which ID to use for creating the portal session
    let customerIdToUse = customerId;
    
    // If no customerId provided, try to get it from the database
    if (!customerIdToUse) {
      // Fetch user from DB to get chargebeeCustomerId
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { chargebeeCustomerId: true },
      });

      if (user?.chargebeeCustomerId) {
        customerIdToUse = user.chargebeeCustomerId;
        console.log('Using chargebeeCustomerId from database:', customerIdToUse);
      }
    }
    
    const chargebee = getChargebee();
    
    // Log available methods on chargebee to debug
    console.log('Available methods on chargebee:', Object.keys(chargebee));
    
    // Create portal session parameters based on available IDs
    let portalParams: any = {};
    
    if (customerIdToUse) {
      // If we have a customer ID, use it
      portalParams = { 
        customer: { id: customerIdToUse } 
      };
    } else if (subscriptionId) {
      // If we have a subscription ID but no customer ID, use the subscription ID
      portalParams = { 
        subscription: { id: subscriptionId } 
      };
    } else {
      // If we don't have either, return an error
      return NextResponse.json({ 
        error: 'Chargebee Customer ID or Subscription ID not found for this user. Please subscribe to a plan first.' 
      }, { status: 404 });
    }
    
    console.log('Creating portal session with params:', portalParams);
    
    // Try multiple methods to create a portal session
    try {
      console.log('Trying portalSession.create...');
      // @ts-ignore
      const result = await chargebee.portalSession.create(portalParams);
      console.log('Portal session created:', result);
      
      const portalSession = result.portal_session;

      if (!portalSession || !portalSession.access_url) {
        throw new Error('Failed to create portal session: No access URL in response');
      }

      return NextResponse.json({ portalUrl: portalSession.access_url });
    } catch (portalError: any) {
      console.error('Error using portalSession.create:', portalError);
      
      // Check for specific error about portal access being disabled
      if (portalError.api_error_code === 'configuration_incompatible' && 
          portalError.error_code === 'portal_access_disabled_for_api') {
        
        // Return a specific error code that the frontend can handle
        return NextResponse.json({ 
          error: 'Customer portal access via API is disabled in your Chargebee account settings.',
          errorCode: 'PORTAL_API_DISABLED',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@videogen.ai'
        }, { status: 403 });
      }
      
      // Try alternative method
      try {
        console.log('Trying portal_session.create...');
        // @ts-ignore
        const result = await chargebee.portal_session.create(portalParams);
        console.log('Portal session created with alternative method:', result);
        
        const portalSession = result.portal_session;

        if (!portalSession || !portalSession.access_url) {
          throw new Error('Failed to create portal session: No access URL in response');
        }

        return NextResponse.json({ portalUrl: portalSession.access_url });
      } catch (alternativeError) {
        console.error('Error using portal_session.create:', alternativeError);
        throw new Error('All methods to create portal session failed');
      }
    }
  } catch (error) {
    console.error('Error creating portal session:', error);
    // @ts-ignore
    const errorMessage = error.message || 'Failed to create portal session';
    // @ts-ignore
    const statusCode = error.http_status_code || 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
