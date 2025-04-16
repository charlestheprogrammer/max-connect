'use client'

import React from 'react'
import { Button } from './ui/button'
import { signIn, signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import { LogOut } from 'lucide-react'

export default function LoginButton({ session }: { session: Session | null }) {
  return (
    <Button
      variant="ghost"
      className="text-white"
      onClick={() => (session && session.user ? signOut() : signIn('google'))}
    >
      {session && session.user ? (
        <>
          <span>{session.user.name?.split(' ')[0]}</span>
          <LogOut />
        </>
      ) : (
        'Se connecter'
      )}
    </Button>
  )
}
