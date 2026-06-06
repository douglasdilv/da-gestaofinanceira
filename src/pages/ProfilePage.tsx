import { useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useAppStore } from '@/store/appStore'
import { toast } from 'sonner'
import { Camera, LogOut, Bell, Moon, Shield, FileDown, FileSpreadsheet, Building2, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useCompanies } from '@/hooks/useCompanies'
import * as Dialog from '@radix-ui/react-dialog'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { data: profile, upsertMutation, uploadAvatar } = useProfile(user?.id)
  const { mode } = useAppStore()
  const { data: companies, createMutation: createCompany, deleteMutation: deleteCompany } = useCompanies(user?.id)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const avatarRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try {
      const url = await uploadAvatar(file, user.id)
      await upsertMutation.mutateAsync({ id: user.id, avatar_url: url })
      toast.success('Foto atualizada!')
    } catch {
      toast.error('Erro ao atualizar foto')
    }
  }

  const handleSignOut = async () => {
    if (!confirm('Sair da conta?')) return
    await signOut()
    navigate('/login')
  }

  const toggleCompany = async () => {
    if (!user || !profile) return
    const newValue = !profile.has_company
    await upsertMutation.mutateAsync({ id: user.id, has_company: newValue })
    if (newValue && (!companies || companies.length === 0)) {
      navigate('/onboarding')
    } else if (!newValue) {
      toast.info('Modo empresarial desativado')
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompanyName.trim() || !user) return
    try {
      await createCompany.mutateAsync({ user_id: user.id, name: newCompanyName, cnpj: null, segment: null, city: null, state: null, opened_at: null })
      toast.success('Empresa adicionada!')
      setNewCompanyName('')
      setIsCompanyModalOpen(false)
    } catch {
      toast.error('Erro ao adicionar empresa')
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Excluir empresa? Essa ação apagará também todas as receitas e despesas vinculadas a ela!')) return
    try {
      await deleteCompany.mutateAsync(companyId)
      toast.success('Empresa excluída')
    } catch {
      toast.error('Erro ao excluir empresa')
    }
  }

  return (
    <div className="py-lg space-y-lg max-w-2xl mx-auto">
      <h2 className="text-headline-lg-mobile font-headline-lg text-on-surface">Perfil</h2>

      {/* Profile card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary-container border-4 border-outline-variant overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold text-on-primary-container">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => avatarRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-on-surface">{profile?.full_name || 'Usuário'}</h3>
          <div className="mt-2 space-y-1 text-body-sm text-on-surface-variant">
            {user?.email && (
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">mail</span>
                {user.email}
              </div>
            )}
            {profile?.cpf && (
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">badge</span>
                {profile.cpf}
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">phone</span>
                {profile.phone}
              </div>
            )}
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 text-label-md font-label-md text-primary bg-primary/10 px-3 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              Membro Ativo
            </span>
          </div>
        </div>
      </div>

      {/* Company toggle */}
      <button
        onClick={toggleCompany}
        className="w-full flex items-center justify-between p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
            <Building2 className="w-5 h-5 text-on-secondary-container" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-on-surface">Possui empresa?</p>
            <p className="text-body-sm text-on-surface-variant">
              {profile?.has_company ? 'Ativo - Gerenciando dados empresariais' : 'Ative para gerenciar dados empresariais'}
            </p>
          </div>
        </div>
        <div className={`w-12 h-7 rounded-full relative transition-all duration-300 ${profile?.has_company ? 'bg-primary' : 'bg-surface-container-highest'}`}>
          <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${profile?.has_company ? 'left-6' : 'left-0.5'}`} />
        </div>
      </button>

      {/* List of Companies */}
      {profile?.has_company && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant">
            <h4 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Minhas Empresas</h4>
            <Dialog.Root open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
              <Dialog.Trigger asChild>
                <button className="flex items-center gap-1 text-primary text-label-md font-label-md hover:bg-primary/10 px-2 py-1 rounded transition-colors">
                  <Plus className="w-4 h-4" /> Nova
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-surface-container-lowest rounded-xl p-lg w-[90vw] max-w-md z-50 animate-scale-in">
                  <Dialog.Title className="text-headline-sm font-headline-sm mb-4">Adicionar Empresa</Dialog.Title>
                  <form onSubmit={handleCreateCompany} className="space-y-4">
                    <div>
                      <label className="text-label-md font-label-md text-on-surface-variant">Nome da Empresa</label>
                      <input
                        type="text"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant py-sm text-body-lg focus:outline-none focus:border-primary transition-colors"
                        placeholder="Ex: Lanchonete, Loja Online..."
                        autoFocus
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Dialog.Close asChild>
                        <button type="button" className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg">Cancelar</button>
                      </Dialog.Close>
                      <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container disabled:opacity-50" disabled={!newCompanyName.trim()}>
                        Salvar
                      </button>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
          <div className="divide-y divide-outline-variant">
            {companies?.length === 0 ? (
              <p className="px-lg py-md text-body-sm text-on-surface-variant text-center">Nenhuma empresa cadastrada.</p>
            ) : (
              companies?.map(company => (
                <div key={company.id} className="flex items-center justify-between px-lg py-md hover:bg-surface-container/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-on-surface" />
                    </div>
                    <p className="font-semibold text-on-surface">{company.name}</p>
                  </div>
                  <button onClick={() => handleDeleteCompany(company.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors" title="Excluir Empresa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Export */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <h4 className="px-lg py-md text-label-md font-label-md text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Exportar dados</h4>
        <div className="divide-y divide-outline-variant">
          <button className="w-full flex items-center gap-3 px-lg py-md hover:bg-surface-container transition-colors" onClick={() => toast.info('Use a página de Relatórios para exportar')}>
            <FileDown className="w-5 h-5 text-error" />
            <div className="text-left">
              <p className="font-semibold text-on-surface">Gerar Relatório PDF</p>
              <p className="text-body-sm text-on-surface-variant">Relatório completo com todos os dados</p>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant ml-auto" />
          </button>
          <button className="w-full flex items-center gap-3 px-lg py-md hover:bg-surface-container transition-colors" onClick={() => toast.info('Use a página de Relatórios para exportar')}>
            <FileSpreadsheet className="w-5 h-5 text-tertiary" />
            <div className="text-left">
              <p className="font-semibold text-on-surface">Exportar Dados Excel</p>
              <p className="text-body-sm text-on-surface-variant">Planilha com todas as movimentações</p>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant ml-auto" />
          </button>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <h4 className="px-lg py-md text-label-md font-label-md text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Configurações</h4>
        <div className="divide-y divide-outline-variant">
          <div className="flex items-center justify-between px-lg py-md">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-on-surface-variant" />
              <div>
                <p className="font-semibold text-on-surface">Notificações</p>
                <p className="text-body-sm text-on-surface-variant">Alertas de gastos e relatórios</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-7 rounded-full relative transition-all duration-300 ${notificationsEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${notificationsEnabled ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-lg py-md">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-on-surface-variant" />
              <div>
                <p className="font-semibold text-on-surface">Modo Escuro</p>
                <p className="text-body-sm text-on-surface-variant">Economia de energia e conforto</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-7 rounded-full relative transition-all duration-300 ${darkMode ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${darkMode ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          <button className="w-full flex items-center gap-3 px-lg py-md hover:bg-surface-container transition-colors">
            <Shield className="w-5 h-5 text-on-surface-variant" />
            <div className="text-left">
              <p className="font-semibold text-on-surface">Segurança</p>
              <p className="text-body-sm text-on-surface-variant">Biometria e PIN de acesso</p>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant ml-auto" />
          </button>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 px-lg py-md text-error hover:bg-error-container/30 rounded-xl transition-all border border-error/20"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-semibold">Sair da Conta</span>
      </button>

      <div className="pb-8 text-center text-[11px] text-on-surface-variant">
        D&A Gestão Financeira v1.0.0
      </div>
    </div>
  )
}
