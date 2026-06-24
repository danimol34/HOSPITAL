import Image from 'next/image'
import { LoginForm } from './LoginForm'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  const { message } = searchParams

  return (
    <div className="relative flex h-screen w-full items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-[-20px] z-0 bg-[url('/images/fondo.jpeg')] bg-cover bg-center bg-no-repeat blur-sm"
      />
      {/* Overlay to ensure the login card stands out */}
      <div className="absolute inset-0 z-0 bg-white/30 dark:bg-black/40" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-sys-panel dark:ring-white/10">
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="mb-6 mt-4 flex items-center justify-center mx-auto">
              <Image
                src="/logo.png"
                alt="Nuestra Señora del Carmen"
                width={260}
                height={140}
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              Sistema Administrativo Interno
            </p>
          </div>

          <LoginForm message={message} />
        </div>
      </div>
    </div>
  )
}
