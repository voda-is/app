import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import TwitterProvider from "next-auth/providers/twitter"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub?.toString() || '' // Add user ID to session
        session.user.username = token.username?.toString() || ''
        session.user.firstName = token.firstName?.toString() || ''
        session.user.lastName = token.lastName?.toString() || ''
        session.user.image = token.picture?.toString() || token.image?.toString() || null
        session.user.provider = token.provider?.toString() || null // Add provider to session
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        
        // Handle Google provider
        if (account.provider === 'google') {
          const googleProfile = profile as any;
          token.username = googleProfile.email; // Use email prefix as username
          token.firstName = googleProfile.given_name;
          token.lastName = googleProfile.family_name;
          token.picture = googleProfile.picture;
          token.sub = googleProfile.sub; // Google ID
        }
        
        // Handle Twitter provider
        if (account.provider === 'twitter') {
          const twitterProfile = profile as any;
          token.username = twitterProfile.data.username; // Twitter handle
          token.firstName = twitterProfile.data.name; // Twitter display name
          token.lastName = ''; // Empty last name as requested
          token.picture = twitterProfile.data.profile_image_url;
          token.sub = twitterProfile.data.id; // Twitter ID
          token.provider = 'x';
        }
      }

      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST } 