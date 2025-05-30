import { NextRequest, NextResponse } from 'next/server';
import chargebee from 'chargebee-typescript';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path
import prisma from '@/lib/prisma'; // Import Prisma client

chargebee.configure({
  site: process.env.CHARGEBEE_SITE!,
  api_key: process.env.CHARGEBEE_API_KEY!,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // @ts-ignore session.user.id should be string (it is, based on callbacks)
  if (!session || !session.user || !session.user.id || typeof session.user.id !== 'string') {
    return NextResponse.json({ error: 'Unauthorized or User ID missing/invalid' }, { status: 401 });
  }

  try {
    // @ts-ignore session.user.id is known to be a string here
    const userId: string = session.user.id;

    // Fetch user from DB to get chargebeeCustomerId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { chargebeeCustomerId: true },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }
    if (!user.chargebeeCustomerId) {
      return NextResponse.json({ error: 'Chargebee Customer ID not found for this user. Please subscribe to a plan first.' }, { status: 404 });
    }

    const customerId = user.chargebeeCustomerId;
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
