import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido').optional().or(z.literal('')),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await signUp(data.email, data.password, {
      full_name: data.fullName,
      phone: data.phone,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Conta criada! Verifique seu e-mail.')
      navigate('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-container-margin py-xl">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-xl">
          <div className="flex justify-center mb-md">
            <img src="/logoapp.png" alt="D&A" className="w-16 h-16 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <h1 className="text-2xl font-bold text-primary">Criar Conta</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Comece sua gestão financeira hoje</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
            {[
              { label: 'Nome Completo', name: 'fullName', type: 'text', placeholder: 'João da Silva' },
              { label: 'E-mail', name: 'email', type: 'email', placeholder: 'joao@email.com' },
              { label: 'Telefone', name: 'phone', type: 'tel', placeholder: '(11) 99999-9999' },
            ].map(field => (
              <div key={field.name} className="space-y-xs">
                <label className="text-label-md font-label-md text-on-surface-variant">{field.label}</label>
                <input
                  {...register(field.name as keyof FormData)}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg text-on-surface transition-colors focus:outline-none focus:border-primary"
                />
                {errors[field.name as keyof FormData] && (
                  <p className="text-xs text-error">{errors[field.name as keyof FormData]?.message}</p>
                )}
              </div>
            ))}

            <div className="space-y-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">Senha</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-outline-variant py-sm pr-10 text-body-lg text-on-surface transition-colors focus:outline-none focus:border-primary"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
            </div>

            <div className="space-y-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">Confirmar Senha</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg text-on-surface transition-colors focus:outline-none focus:border-primary"
              />
              {errors.confirmPassword && <p className="text-xs text-error">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60 mt-lg"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-body-sm text-on-surface-variant mt-lg">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
