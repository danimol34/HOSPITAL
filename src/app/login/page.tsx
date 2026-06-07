import Image from 'next/image'
import { LoginForm } from './LoginForm'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  const { message } = searchParams

  return (
    <div className="flex h-screen w-full items-center justify-center bg-sys-bg p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-sys-panel shadow-2xl ring-1 ring-white/10">
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="mb-6 mt-6 flex h-[260px] w-[260px] items-center justify-center rounded-full bg-black shadow-lg mx-auto">
              <Image
                src="/logo.png"
                alt="Nuestra Señora del Carmen"
                width={220}
                height={80}
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Sistema Administrativo Interno
            </p>
          </div>

          <LoginForm message={message} />
        </div>
      </div>
    </div>
  )
}
