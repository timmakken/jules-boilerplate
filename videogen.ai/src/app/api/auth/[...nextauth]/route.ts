import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Import the PrismaAdapter and your Prisma client
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma'; // Adjust path if your prisma client is elsewhere

export const authOptions: NextAuthOptions = {
  // Add the PrismaAdapter, configured with your Prisma client
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // You can add more providers here
  ],
  session: {
    // Using JWT for session strategy.
    // If you prefer database sessions with the adapter, you can set this to 'database'
    // or remove the strategy line (as 'database' is default when adapter is present).
    // JWTs are generally simpler for stateless session management.
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // If using an adapter, the user object will be the user from your database.
      // The `user` object is only passed on initial sign-in when using JWT strategy with an adapter.
      if (user) { // `user` is available on first sign-in
        token.id = user.id; // Persist the user.id from the database into the token
      }
      if (account) { // `account` is available on first sign-in (e.g. OAuth flow)
        token.accessToken = account.access_token;
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      // The `user` object here is the user from the database if using database sessions,
      // or a subset of the token if using JWT sessions.
      // We're ensuring the session.user.id is populated from the token.
      // @ts-ignore
      session.user.id = token.id;
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.id_token = token.id_token;

      // You can also fetch additional user data from your database here
      // and add it to the session, if needed.
      // Example:
      // if (token.id && session.user) {
      //   const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
      //   if (dbUser) {
      //     session.user.chargebeeCustomerId = dbUser.chargebeeCustomerId;
      //     // session.user.roles = dbUser.roles; // if you have roles
      //   }
      // }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
