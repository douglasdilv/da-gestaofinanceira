import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { seedDefaultCategories } from '@/hooks/useCategories'
import { supabase } from '@/lib/supabase'
import { Building2, User, CheckCircle, Camera } from 'lucide-react'

const personalSchema = z.object({
  fullName: z.string().min(2),
  cpf: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
})

const companySchema = z.object({
  hasCompany: z.boolean(),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
  segment: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

type PersonalData = z.infer<typeof personalSchema>
type CompanyData = z.infer<typeof companySchema>

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { upsertMutation, uploadAvatar } = useProfile(user?.id)
  const navigate = useNavigate()

  const personalForm = useForm<PersonalData>({ resolver: zodResolver(personalSchema) })
  const companyForm = useForm<CompanyData>({ resolver: zodResolver(companySchema), defaultValues: { hasCompany: false } })
  const hasCompany = companyForm.watch('hasCompany')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarUrl(URL.createObjectURL(file))
  }

  const onPersonalSubmit = async (data: PersonalData) => {
    if (!user) return
    setLoading(true)
    try {
      let finalAvatarUrl = null
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile, user.id)
      }
      await upsertMutation.mutateAsync({
        id: user.id,
        full_name: data.fullName,
        cpf: data.cpf || null,
        phone: data.phone || null,
        avatar_url: finalAvatarUrl,
        has_company: false,
      })
      await seedDefaultCategories(user.id)
      setStep(2)
    } catch (err) {
      toast.error('Erro ao salvar perfil')
    }
    setLoading(false)
  }

  const onCompanySubmit = async (data: CompanyData) => {
    if (!user) return
    setLoading(true)
    try {
      if (data.hasCompany && data.companyName) {
        await supabase.from('companies').insert({
          user_id: user.id,
          name: data.companyName,
          cnpj: data.cnpj || null,
          segment: data.segment || null,
          city: data.city || null,
          state: data.state || null,
        })
        await upsertMutation.mutateAsync({ id: user.id, has_company: true })
      }
      navigate('/')
    } catch (err) {
      toast.error('Erro ao salvar empresa')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-container-margin py-xl">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-xl">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 transition-all ${step > s ? 'bg-primary' : 'bg-outline-variant'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex items-center gap-3 mb-lg">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-headline-md font-headline-md">Dados Pessoais</h2>
                <p className="text-body-sm text-on-surface-variant">Passo 1 de 2</p>
              </div>
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-lg">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border-2 border-outline-variant group-hover:border-primary transition-colors">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-on-surface-variant" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-md">
              {[
                { label: 'Nome Completo *', name: 'fullName', type: 'text', placeholder: 'João da Silva' },
                { label: 'CPF', name: 'cpf', type: 'text', placeholder: '000.000.000-00' },
                { label: 'Telefone', name: 'phone', type: 'tel', placeholder: '(11) 99999-9999' },
              ].map(f => (
                <div key={f.name} className="space-y-xs">
                  <label className="text-label-md font-label-md text-on-surface-variant">{f.label}</label>
                  <input
                    {...personalForm.register(f.name as keyof PersonalData)}
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                  {personalForm.formState.errors[f.name as keyof PersonalData] && (
                    <p className="text-xs text-error">{personalForm.formState.errors[f.name as keyof PersonalData]?.message}</p>
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-md rounded-lg text-label-md font-label-md mt-lg hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Salvando...' : 'Continuar'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Company */}
        {step === 2 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex items-center gap-3 mb-lg">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center">
                <Building2 className="w-5 h-5 text-on-tertiary-container" />
              </div>
              <div>
                <h2 className="text-headline-md font-headline-md">Dados Empresariais</h2>
                <p className="text-body-sm text-on-surface-variant">Passo 2 de 2 (opcional)</p>
              </div>
            </div>

            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-md">
              {/* Toggle */}
              <div className="flex items-center justify-between p-md bg-surface-container-low rounded-xl border border-outline-variant">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-on-surface">Possui empresa?</p>
                    <p className="text-body-sm text-on-surface-variant">Ative para gerenciar dados empresariais</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => companyForm.setValue('hasCompany', !hasCompany)}
                  className={`w-12 h-7 rounded-full transition-all duration-300 relative ${hasCompany ? 'bg-primary' : 'bg-surface-container-highest'}`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${hasCompany ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {hasCompany && (
                <div className="space-y-md animate-fade-in">
                  {[
                    { label: 'Nome da Empresa *', name: 'companyName', placeholder: 'Empresa LTDA' },
                    { label: 'CNPJ', name: 'cnpj', placeholder: '00.000.000/0001-00' },
                    { label: 'Segmento', name: 'segment', placeholder: 'Tecnologia, Alimentação...' },
                    { label: 'Cidade', name: 'city', placeholder: 'São Paulo' },
                    { label: 'Estado', name: 'state', placeholder: 'SP' },
                  ].map(f => (
                    <div key={f.name} className="space-y-xs">
                      <label className="text-label-md font-label-md text-on-surface-variant">{f.label}</label>
                      <input
                        {...companyForm.register(f.name as keyof CompanyData)}
                        type="text"
                        placeholder={f.placeholder}
                        className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-sm pt-md">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 border border-outline text-on-surface py-md rounded-lg text-label-md font-label-md hover:bg-surface-container transition-all"
                >
                  Pular
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-on-primary py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Salvando...' : 'Concluir'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
