import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connect } from './utils/server/mongoose'
import { User } from './app/api/models/user'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      // Check if the user is allowed to sign in
      if (account?.provider === 'google') {
        await connect()
        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name,
            email: user.email,
            profilePicture: profile?.picture,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true } // Create a new user if it doesn't exist
        ).exec()
        console.log('created')
      }
      return true // Allow sign-in
    },
    session: async ({ session }) => {
      if (session.user) {
        await connect()
        const userEnriched = await User.findOne<User>({
          email: session.user.email,
        }).exec()
        session.user.preferences = userEnriched?.preferences
        session.user.profilePicture = userEnriched?.profilePicture
        session.user._id = userEnriched?._id
      }
      return session
    },
  },
})
