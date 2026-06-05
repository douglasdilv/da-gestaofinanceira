import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Mail, Phone, Lock } from 'lucide-react'

const emailSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

const phoneSchema = z.object({
  phone: z.string().min(10, 'Telefone inválido'),
})

type EmailForm = z.infer<typeof emailSchema>
type PhoneForm = z.infer<typeof phoneSchema>

export default function LoginPage() {
  const [tab, setTab] = useState<'email' | 'phone'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) })

  const onEmailSubmit = async (data: EmailForm) => {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    setLoading(false)
    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos'
        : error.message)
    } else {
      navigate('/')
    }
  }

  const onPhoneSubmit = async (_data: PhoneForm) => {
    toast.info('Login por telefone em breve disponível')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Form */}
      <main className="flex-1 flex items-center justify-center px-container-margin py-xl lg:py-0">
        <div className="w-full max-w-md animate-fade-in">
          {/* Brand */}
          <div className="text-center mb-xl">
            <div className="flex justify-center mb-md">
              <img
                src="/logoapp.png"
                alt="D&A"
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.style.display = 'none'
                  const p = t.parentElement
                  if (p) {
                    p.innerHTML = `<div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center"><span class="text-2xl font-bold text-white">D&A</span></div>`
                  }
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-primary">D&A Gestão Financeira</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">Gestão sofisticada para seu patrimônio</p>
          </div>

          {/* Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            {/* Tabs */}
            <div className="flex mb-lg border-b border-outline-variant">
              <button
                onClick={() => setTab('email')}
                className={`flex-1 py-md text-label-md font-label-md transition-all ${tab === 'email' ? 'border-b-2 border-primary text-primary -mb-px' : 'text-on-surface-variant'}`}
              >
                Email
              </button>
              <button
                onClick={() => setTab('phone')}
                className={`flex-1 py-md text-label-md font-label-md transition-all ${tab === 'phone' ? 'border-b-2 border-primary text-primary -mb-px' : 'text-on-surface-variant'}`}
              >
                Telefone
              </button>
            </div>

            {/* Email form */}
            {tab === 'email' && (
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-lg">
                <div className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                    <input
                      {...emailForm.register('email')}
                      type="email"
                      placeholder="nome@exemplo.com"
                      className="w-full bg-transparent border-b border-outline-variant py-sm pl-6 pr-2 text-body-lg text-on-surface transition-colors focus:outline-none focus:border-primary"
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-xs text-error">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                    <input
                      {...emailForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-b border-outline-variant py-sm pl-6 pr-10 text-body-lg text-on-surface transition-colors focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {emailForm.formState.errors.password && (
                    <p className="text-xs text-error">{emailForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-label-md font-label-md text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Entrando...' : 'Acessar Conta'}
                </button>
              </form>
            )}

            {/* Phone form */}
            {tab === 'phone' && (
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-lg">
                <div className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">Número de Telefone</label>
                  <div className="flex items-center gap-sm border-b border-outline-variant py-sm">
                    <Phone className="text-on-surface-variant w-4 h-4" />
                    <span className="text-body-lg text-on-surface-variant">+55</span>
                    <input
                      {...phoneForm.register('phone')}
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="flex-1 bg-transparent text-body-lg text-on-surface focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Enviaremos um código de verificação via SMS para confirmar sua identidade.
                </p>
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98]"
                >
                  Enviar código OTP
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-xl text-center">
              <hr className="border-outline-variant" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container-lowest px-md text-label-md font-label-md text-on-surface-variant">
                OU
              </span>
            </div>

            <Link
              to="/register"
              className="block w-full border border-outline text-primary py-md rounded-lg text-label-md font-label-md text-center hover:bg-surface-container transition-all active:scale-[0.98]"
            >
              Criar conta
            </Link>
          </div>

          <p className="text-center text-body-sm text-on-surface-variant mt-xl">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-primary underline">Termos de Uso</a>{' '}
            e{' '}
            <a href="#" className="text-primary underline">Privacidade</a>.
          </p>
        </div>
      </main>

      {/* Right: Decorative panel (desktop) */}
      <div className="hidden lg:flex w-[40%] bg-primary flex-col justify-end p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-da-gold rounded-full blur-2xl" />
        </div>
        <div className="relative">
          <span className="material-symbols-outlined text-white/40 text-[120px]">account_balance</span>
          <h2 className="text-3xl font-bold text-white mb-4 mt-4">Sua segurança é nossa prioridade.</h2>
          <p className="text-white/70 text-body-lg">
            Utilizamos criptografia de ponta e autenticação multifator para proteger seus dados financeiros.
          </p>
        </div>
      </div>
    </div>
  )
}
