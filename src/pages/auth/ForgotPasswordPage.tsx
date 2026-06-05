import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({ email: z.string().email('E-mail inválido') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await resetPassword(data.email)
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-container-margin">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/login" className="inline-flex items-center gap-2 text-body-sm text-on-surface-variant mb-lg hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          {sent ? (
            <div className="text-center py-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-md">
                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              </div>
              <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Email enviado!</h2>
              <p className="text-body-sm text-on-surface-variant">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-headline-md font-headline-md text-on-surface mb-xs">Recuperar Senha</h1>
              <p className="text-body-sm text-on-surface-variant mb-lg">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
                <div className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">E-mail</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="nome@exemplo.com"
                    className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
