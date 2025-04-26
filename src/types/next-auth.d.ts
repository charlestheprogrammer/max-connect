import { DefaultSession } from 'next-auth'
import type { User } from '@/app/api/models/user'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User & DefaultSession['user']
  }
}
