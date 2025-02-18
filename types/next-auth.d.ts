import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      firstName: string
      lastName: string | null
      image: string | null
      provider: string | null
    }
  }
} 