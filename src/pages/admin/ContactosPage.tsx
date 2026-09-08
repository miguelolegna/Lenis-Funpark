import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  GraduationCap,
  Building2,
  MessageCircle,
  Phone,
  Clock,
  CheckCircle2,
  Search,
  Copy,
  Check,
  Send,
  Trash2,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { pageVariants, pageTransition } from '../../lib/animations';
import { supabase } from '../../lib/supabase';

export interface MensagemItem {
  id: string;
  nome: string;
  contacto: string;
  email?: string;
  categoria: 'escola' | 'instituicao' | 'geral';
  assunto: string;
  mensagem: string;
  data: string;
  preferencia?: 'whatsapp' | 'email' | 'telefone';
  respondido: boolean;
  canal_resposta?: string;
  notas_admin?: string;
}

const initialMensagens: MensagemItem[] = [
  {
    id: 'msg-1',
    nome: 'Colégio São José - Prof.ª Carla',
    contacto: '912 345 678',
    email: 'secretaria@colegiosaojose.pt',
    categoria: 'escola',
    assunto: 'Visita Escolar - 2 Turmas do 3º Ano',
    mensagem: 'Gostaríamos de saber a disponibilidade para uma visita com cerca de 45 crianças numa sexta-feira de manhã e os pacotes especiais disponíveis.',
    data: new Date(Date.now() - 3600000 * 3).toISOString(),
    preferencia: 'email',
    respondido: false,
  },
  {
    id: 'msg-2',
    nome: 'Associação Viver Mais - Dr. Pedro',
    contacto: '934 567 890',
    categoria: 'instituicao',
    assunto: 'Atividade de ATL de Férias',
    mensagem: 'Estamos a organizar as atividades para as férias escolares com um grupo de 20 crianças. Pretendemos um dia completo com almoço.',
    data: new Date(Date.now() - 3600000 * 24).toISOString(),
    preferencia: 'whatsapp',
    respondido: false,
  },
  {
    id: 'msg-3',
    nome: 'Mariana Silva',
    contacto: '961 234 567',
    categoria: 'geral',
    assunto: 'Dúvida sobre restrições alimentares no bolo',
    mensagem: 'Olá! Um dos amiguinhos da festa tem intolerância severa a lactose. É possível personalizar o recheio do bolo incluído?',
    data: new Date(Date.now() - 3600000 * 48).toISOString(),
    preferencia: 'whatsapp',
    respondido: true,
    canal_resposta: 'whatsapp',
    notas_admin: 'Informado que os bolos são feitos na pastelaria parceira com opções sem lactose.',
  },
];

export default function ContactosPage() {
  const [mensagens, setMensagens] = useState<MensagemItem[]>(() => {
    const saved = localStorage.getItem('admin_mensagens');
    return saved ? JSON.parse(saved) : initialMensagens;
  });

  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | 'escola' | 'instituicao' | 'geral'>('todas');
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendentes' | 'respondidas'>('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  // Carregar mensagens do Supabase e sincronizar com localStorage
  const fetchMensagens = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mensagens_contacto')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: MensagemItem[] = data.map((d) => ({
          id: d.id,
          nome: d.nome,
          contacto: d.contacto,
          email: d.email || (d.contacto.includes('@') ? d.contacto : undefined),
          categoria: (d.categoria as 'escola' | 'instituicao' | 'geral') || 'geral',
          assunto: d.motivo || 'Mensagem do Site',
          mensagem: d.mensagem,
          data: d.created_at || new Date().toISOString(),
          preferencia: d.preferencia_resposta || 'whatsapp',
          respondido: Boolean(d.respondido),
          canal_resposta: d.canal_resposta,
          notas_admin: d.notas_admin,
        }));

        setMensagens(mapped);
        localStorage.setItem('admin_mensagens', JSON.stringify(mapped));
        window.dispatchEvent(new Event('admin_messages_updated'));
      } else {
        // Fallback para localStorage
        const saved = localStorage.getItem('admin_mensagens');
        if (saved) {
          setMensagens(JSON.parse(saved));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar mensagens do Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMensagens();

    // Subscrição Supabase Realtime
    const channel = supabase
      .channel('admin_mensagens_contacto_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensagens_contacto',
        },
        () => {
          fetchMensagens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMensagens]);

  // Persistir alterações locais e notificar eventos
  const saveAndSync = (updated: MensagemItem[]) => {
    setMensagens(updated);
    localStorage.setItem('admin_mensagens', JSON.stringify(updated));
    window.dispatchEvent(new Event('admin_messages_updated'));
  };

  // Alternar estado de respondido
  const handleToggleRespondido = async (id: string, novoCanal?: string) => {
    const item = mensagens.find((m) => m.id === id);
    if (!item) return;

    const novoRespondido = !item.respondido;
    const canal = novoRespondido ? novoCanal || item.canal_resposta || 'whatsapp' : undefined;

    const updated = mensagens.map((m) =>
      m.id === id ? { ...m, respondido: novoRespondido, canal_resposta: canal } : m
    );
    saveAndSync(updated);

    // Tentar atualizar no Supabase se existir
    try {
      await supabase
        .from('mensagens_contacto')
        .update({
          respondido: novoRespondido,
          canal_resposta: canal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (e) {
      console.error('Erro ao atualizar estado no Supabase:', e);
    }
  };

  // Guardar notas internas
  const handleSaveNotes = async (id: string) => {
    const updated = mensagens.map((m) =>
      m.id === id ? { ...m, notas_admin: notesText } : m
    );
    saveAndSync(updated);
    setEditingNotesId(null);

    try {
      await supabase
        .from('mensagens_contacto')
        .update({
          notas_admin: notesText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (e) {
      console.error('Erro ao guardar notas no Supabase:', e);
    }
  };

  // Eliminar mensagem
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Tem a certeza de que deseja eliminar esta mensagem?')) return;

    const updated = mensagens.filter((m) => m.id !== id);
    saveAndSync(updated);

    try {
      await supabase.from('mensagens_contacto').delete().eq('id', id);
    } catch (e) {
      console.error('Erro ao eliminar no Supabase:', e);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Resposta por WhatsApp
  const handleReplyWhatsApp = (item: MensagemItem) => {
    const digits = item.contacto.replace(/\D/g, '');
    const cleanNumber = digits.startsWith('351') ? digits : `351${digits}`;
    const saudacao = `Olá ${item.nome}! Entramos em contacto da equipa do Leni's FunPark relativamente à sua mensagem sobre "${item.assunto}".`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(saudacao)}`;
    window.open(url, '_blank');

    if (!item.respondido) {
      handleToggleRespondido(item.id, 'whatsapp');
    }
  };

  // Resposta por Email
  const handleReplyEmail = (item: MensagemItem) => {
    const emailDestino = item.email || (item.contacto.includes('@') ? item.contacto : '');
    if (!emailDestino) {
      alert('Esta mensagem não tem um endereço de email associado. Utilize o WhatsApp ou telefone.');
      return;
    }
    const assuntoEmail = `Leni's FunPark - Re: ${item.assunto}`;
    const corpo = `Olá ${item.nome},\n\nAgradecemos o seu contacto com o Leni's FunPark relativamente a "${item.assunto}".\n\nEm resposta à sua questão:\n\nCom os melhores cumprimentos,\nEquipa Leni's FunPark`;
    const mailtoUrl = `mailto:${emailDestino}?subject=${encodeURIComponent(assuntoEmail)}&body=${encodeURIComponent(corpo)}`;
    window.open(mailtoUrl, '_blank');

    if (!item.respondido) {
      handleToggleRespondido(item.id, 'email');
    }
  };

  // Resposta por Telefone
  const handleReplyPhone = (item: MensagemItem) => {
    const digits = item.contacto.replace(/[^\d+]/g, '');
    window.open(`tel:${digits}`, '_self');
  };

  // Filtragem
  const mensagensFiltradas = mensagens.filter((m) => {
    const matchesCat = filtroCategoria === 'todas' || m.categoria === filtroCategoria;
    const matchesEstado =
      filtroEstado === 'todas'
        ? true
        : filtroEstado === 'pendentes'
        ? !m.respondido
        : m.respondido;

    const matchesSearch =
      m.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      m.assunto.toLowerCase().includes(pesquisa.toLowerCase()) ||
      m.contacto.includes(pesquisa) ||
      m.mensagem.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (m.notas_admin && m.notas_admin.toLowerCase().includes(pesquisa.toLowerCase()));

    return matchesCat && matchesEstado && matchesSearch;
  });

  const pendentesCount = mensagens.filter((m) => !m.respondido).length;
  const respondidasCount = mensagens.filter((m) => m.respondido).length;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-surface-alt">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Comunicação & Triagem
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary mt-1">
            Mensagens & Pedidos de Contacto
          </h1>
          <p className="text-sm text-secondary/60 font-medium mt-0.5">
            Mensagens submetidas no site pelo formulário. Escolha o canal para responder diretamente ao cliente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMensagens}
            disabled={loading}
            className="p-2.5 rounded-xl border border-surface-alt text-secondary/70 hover:text-primary hover:bg-surface-alt transition-colors"
            title="Atualizar mensagens"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <span className="px-4 py-2 rounded-2xl text-xs font-black bg-accent text-white shadow-xs">
            {pendentesCount} {pendentesCount === 1 ? 'pendente' : 'pendentes'}
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Tabs de Categoria */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltroCategoria('todas')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                filtroCategoria === 'todas'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-secondary/70 hover:bg-surface-alt border border-surface-alt'
              }`}
            >
              Todas as Categorias ({mensagens.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('escola')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filtroCategoria === 'escola'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-secondary/70 hover:bg-surface-alt border border-surface-alt'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Escolas</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('instituicao')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filtroCategoria === 'instituicao'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-secondary/70 hover:bg-surface-alt border border-surface-alt'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Instituições</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('geral')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filtroCategoria === 'geral'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-secondary/70 hover:bg-surface-alt border border-surface-alt'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Geral & Festas</span>
            </button>
          </div>

          {/* Input de Pesquisa */}
          <div className="relative">
            <Search className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome, contacto, texto..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-surface-alt rounded-xl text-xs sm:text-sm font-semibold text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary transition-colors w-full sm:w-72"
            />
          </div>
        </div>

        {/* Tabs de Estado de Resposta */}
        <div className="flex items-center gap-2 bg-surface-alt/60 p-1.5 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setFiltroEstado('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filtroEstado === 'todas'
                ? 'bg-white text-secondary shadow-xs'
                : 'text-secondary/60 hover:text-secondary'
            }`}
          >
            Todos os Estados
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('pendentes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filtroEstado === 'pendentes'
                ? 'bg-white text-accent shadow-xs'
                : 'text-secondary/60 hover:text-accent'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Aguardam Resposta ({pendentesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('respondidas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filtroEstado === 'respondidas'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-secondary/60 hover:text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Respondidas ({respondidasCount})</span>
          </button>
        </div>
      </div>

      {/* Lista de Mensagens com Opções de Resposta do Admin */}
      <div className="space-y-4">
        {mensagensFiltradas.length === 0 ? (
          <div className="p-12 text-center text-secondary/50 font-semibold bg-white rounded-3xl border-2 border-surface-alt">
            Nenhuma mensagem encontrada com os filtros selecionados.
          </div>
        ) : (
          mensagensFiltradas.map((item) => {
            const dataEnvio = new Date(item.data);
            const isEmailContact = item.contacto.includes('@') || Boolean(item.email);
            const isEditingThisNote = editingNotesId === item.id;

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border-2 transition-all shadow-xs ${
                  item.respondido
                    ? 'bg-white/80 border-surface-alt opacity-85'
                    : 'bg-white border-primary/20 hover:border-primary/50 shadow-sm'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Dados e Conteúdo da Mensagem */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge da Categoria */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          item.categoria === 'escola'
                            ? 'bg-blue-100 text-blue-800'
                            : item.categoria === 'instituicao'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.categoria === 'escola'
                          ? 'Escolas'
                          : item.categoria === 'instituicao'
                          ? 'Instituição'
                          : 'Geral & Festas'}
                      </span>

                      {/* Badge de Estado */}
                      {item.respondido ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Respondido {item.canal_resposta ? `via ${item.canal_resposta}` : ''}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-accent/15 text-accent border border-accent/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                          Aguarda Resposta
                        </span>
                      )}

                      {/* Preferência do Cliente */}
                      {item.preferencia && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface-alt text-secondary/70 flex items-center gap-1">
                          Prefere:{' '}
                          {item.preferencia === 'whatsapp'
                            ? 'WhatsApp'
                            : item.preferencia === 'email'
                            ? 'Email'
                            : 'Chamada'}
                        </span>
                      )}

                      {/* Data de Envio */}
                      <span className="text-xs text-secondary/40 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {dataEnvio.toLocaleDateString('pt-PT')} às{' '}
                        {dataEnvio.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-secondary">{item.assunto}</h3>

                    {/* Identificação do Cliente */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-secondary/70">
                      <span className="font-black text-secondary text-sm">{item.nome}</span>
                      <span className="flex items-center gap-1 bg-surface-alt px-2.5 py-1 rounded-lg">
                        <Phone className="w-3.5 h-3.5 text-secondary/50" />
                        {item.contacto}
                      </span>
                      {item.email && (
                        <span className="flex items-center gap-1 bg-surface-alt px-2.5 py-1 rounded-lg">
                          <Mail className="w-3.5 h-3.5 text-secondary/50" />
                          {item.email}
                        </span>
                      )}
                    </div>

                    {/* Mensagem enviada */}
                    <div className="mt-3 text-sm text-secondary/90 bg-surface-alt/40 p-4 rounded-2xl border border-surface-alt leading-relaxed">
                      {item.mensagem}
                    </div>

                    {/* Notas Internas do Admin */}
                    {item.notas_admin && !isEditingThisNote && (
                      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl flex items-start justify-between gap-2 mt-2">
                        <div className="flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 mt-0.5 text-amber-700 shrink-0" />
                          <div>
                            <span className="font-bold">Nota Interna: </span>
                            <span>{item.notas_admin}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotesId(item.id);
                            setNotesText(item.notas_admin || '');
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:underline shrink-0"
                        >
                          Editar
                        </button>
                      </div>
                    )}

                    {/* Formulário de edição de notas */}
                    {isEditingThisNote && (
                      <div className="mt-2 p-3 bg-white border-2 border-primary/30 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-secondary">
                          Adicionar / Editar Nota Interna da Equipa:
                        </label>
                        <input
                          type="text"
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Ex: Contactado no WhatsApp dia 8. Orçamento de 30 crianças aprovado."
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-primary font-medium"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 text-xs font-bold text-secondary/60 hover:text-secondary"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(item.id)}
                            className="px-3 py-1 text-xs font-black bg-primary text-white rounded-lg hover:bg-primary/90"
                          >
                            Guardar Nota
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Painel de Ações e Resposta à Escolha do Admin */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 lg:w-56 border-t lg:border-t-0 lg:border-l border-surface-alt pt-4 lg:pt-0 lg:pl-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary/40 mb-0.5 hidden lg:block">
                      Escolher Resposta:
                    </span>

                    {/* Opção 1: WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleReplyWhatsApp(item)}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Responder via WhatsApp</span>
                    </button>

                    {/* Opção 2: Email */}
                    <button
                      type="button"
                      onClick={() => handleReplyEmail(item)}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Responder por Email</span>
                    </button>

                    {/* Opção 3: Telefone (Se não for apenas email) */}
                    {!isEmailContact && (
                      <button
                        type="button"
                        onClick={() => handleReplyPhone(item)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-surface-alt hover:bg-surface-alt/80 text-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Fazer Chamada</span>
                      </button>
                    )}

                    <div className="h-px bg-surface-alt my-1" />

                    {/* Botão Copiar Dados */}
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, `${item.nome} • ${item.contacto}\nAssunto: ${item.assunto}\n${item.mensagem}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface-alt border border-surface-alt text-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-secondary/50" />
                          <span>Copiar Dados</span>
                        </>
                      )}
                    </button>

                    {/* Botão Adicionar Nota */}
                    {!item.notas_admin && !isEditingThisNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(item.id);
                          setNotesText('');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-secondary/70 hover:text-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Adicionar Nota</span>
                      </button>
                    )}

                    {/* Alternar Respondido / Pendente */}
                    <button
                      type="button"
                      onClick={() => handleToggleRespondido(item.id)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                        item.respondido
                          ? 'bg-surface-alt text-secondary/70 hover:bg-surface border-surface-alt'
                          : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/30'
                      }`}
                    >
                      <span>{item.respondido ? 'Marcar como Pendente' : 'Marcar como Respondido'}</span>
                    </button>

                    {/* Eliminar Mensagem */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(item.id)}
                      className="inline-flex items-center justify-center gap-1 px-2 py-1 text-rose-600 hover:text-rose-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                      title="Eliminar mensagem"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
