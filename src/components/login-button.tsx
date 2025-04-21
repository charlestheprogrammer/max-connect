'use client'

import React from 'react'
import { Button } from './ui/button'
import { signIn, signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import { LogOut } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function LoginButton({ session }: { session: Session | null }) {
  return (
    <Button
      variant="ghost"
      className="text-white"
      onClick={() => (session && session.user ? signOut() : signIn('google'))}
    >
      {session && session.user ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <span>{session.user.name?.split(' ')[0]}</span>
                <LogOut />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-black">
              Se déconnecter
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        'Se connecter'
      )}
    </Button>
  )
}
