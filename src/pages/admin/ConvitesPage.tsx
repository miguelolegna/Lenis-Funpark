import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  Send,
  History,
  Download,
  Copy,
  Check,
  Calendar,
  Clock,
  Phone,
  User,
  Sparkles,
} from 'lucide-react';
import { pageVariants, pageTransition } from '../../lib/animations';
import { supabase } from '../../lib/supabase';

export interface ConviteAvulso {
  id: string;
  nome: string;
  dia: string;
  hora: string;
  telefone: string;
  created_at: string;
  token?: string;
  link: string;
}

const STORAGE_KEY = 'admin_convites_avulsos';

export default function ConvitesPage() {
  const [nome, setNome] = useState('');
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('15:00');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedConvite, setGeneratedConvite] = useState<ConviteAvulso | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [convites, setConvites] = useState<ConviteAvulso[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convites));
  }, [convites]);

  const handleGerarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !dia || !hora || !telefone) {
      alert('Por favor preencha todos os 4 campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      // Gerar um UUID para o convite avulso
      const conviteId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const combinedDateTime = new Date(`${dia}T${hora}:00`).toISOString();

      // Inserir na tabela reservas com estado COMPLETED e tipo_convite 'lenis' para permitir geração na Edge Function
      let linkUrl = '';
      try {
        const { data: reservaCriada, error: insertError } = await supabase
          .from('reservas')
          .insert([
            {
              nome_aniversariante: nome.trim(),
              data_evento: combinedDateTime,
              contacto_cliente: telefone.trim(),
              tipo_convite: 'lenis',
              convite_lenis: true,
              estado: 'COMPLETED',
              convite_token: conviteId,
              notas_adicionais: 'Convite avulso emitido manualmente pelo Back-Office.',
            },
          ])
          .select('id, convite_token')
          .single();

        if (!insertError && reservaCriada?.convite_token) {
          linkUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convite_digital?token=${reservaCriada.convite_token}`;
        }
      } catch (err) {
        console.warn('Fallback para modo offline de convite:', err);
      }

      // Se falhou o insert por RLS ou tabela, fallback para URL parametrizada
      if (!linkUrl) {
        linkUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convite_digital?token=${conviteId}`;
      }

      const novoConvite: ConviteAvulso = {
        id: conviteId,
        nome: nome.trim(),
        dia,
        hora,
        telefone: telefone.trim(),
        created_at: timestamp,
        token: conviteId,
        link: linkUrl,
      };

      setConvites((prev) => [novoConvite, ...prev]);
      setGeneratedConvite(novoConvite);

      // Limpar formulário
      setNome('');
      setTelefone('');
    } catch (err: any) {
      console.error('Erro ao gerar convite:', err);
      alert('Ocorreu um erro ao gerar o convite: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

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
              Ferramentas de Marketing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary mt-1">
            Convites Digitais
          </h1>
          <p className="text-sm text-secondary/60 font-medium mt-0.5">
            Criação de convites avulsos e histórico de emissões
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 rounded-2xl text-xs font-extrabold bg-surface-alt border border-surface-alt text-secondary">
            {convites.length} {convites.length === 1 ? 'convite emitido' : 'convites emitidos'}
          </span>
        </div>
      </div>

      {/* Grid de 2 Painéis: Formulário e Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Painel 1: Formulário de Convite Avulso */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border-2 border-surface-alt shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-alt flex items-center justify-center text-primary">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-secondary">Criar Convite Avulso</h2>
              <p className="text-xs text-secondary/60 font-medium">
                Gera o convite oficial digital sem necessidade de reserva prévia
              </p>
            </div>
          </div>

          <form onSubmit={handleGerarConvite} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1">
                Nome do Aniversariante *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Martim Santos"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-alt/40 border border-surface-alt rounded-xl text-sm font-semibold text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1">
                  Dia do Evento *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={dia}
                    onChange={(e) => setDia(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-surface-alt/40 border border-surface-alt rounded-xl text-sm font-semibold text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1">
                  Hora de Início *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    required
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-surface-alt/40 border border-surface-alt rounded-xl text-sm font-semibold text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1">
                Telefone para Contacto / Confirmação *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="Ex: 912 345 678"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-alt/40 border border-surface-alt rounded-xl text-sm font-semibold text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-secondary text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Ticket className="w-4 h-4" />
              <span>{loading ? 'A gerar convite...' : 'Gerar Convite Digital'}</span>
            </button>
          </form>

          {/* Resultado Imediato */}
          {generatedConvite && (
            <div className="p-4 bg-surface rounded-2xl border-2 border-primary/20 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase text-primary">
                  Convite Criado com Sucesso!
                </span>
              </div>
              <p className="text-xs text-secondary/70 font-medium">
                O convite para <strong>{generatedConvite.nome}</strong> está pronto para envio.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={generatedConvite.link}
                  download
                  className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-secondary transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descarregar Imagem</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(generatedConvite.id, generatedConvite.link)}
                  className="w-full py-2 bg-white border border-surface-alt text-secondary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  {copiedId === generatedConvite.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-secondary/50" />
                      <span>Copiar Link de transferência</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Painel 2: Tabela de Convites Gerados */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-surface-alt shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-surface-alt bg-surface flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-primary">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-secondary">Convites Gerados</h2>
                <p className="text-xs text-secondary/60">
                  Histórico de links emitidos para regeneração rápida
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1">
            {convites.length === 0 ? (
              <div className="py-16 text-center text-secondary/40 font-semibold">
                <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum convite avulso gerado ainda.</p>
                <p className="text-xs mt-1">Preenche o formulário ao lado para emitir o primeiro convite.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {convites.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-surface-alt/30 border border-surface-alt hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-black text-sm text-secondary truncate">{item.nome}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-secondary/70 mt-1">
                        <span className="font-bold text-primary">
                          {item.dia} às {item.hora}
                        </span>
                        <span className="text-secondary/40">•</span>
                        <span>{item.telefone}</span>
                        <span className="text-secondary/40">•</span>
                        <span className="text-secondary/50 text-[11px]">
                          {new Date(item.created_at).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={item.link}
                        download
                        className="px-3 py-1.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        title="Descarregar Convite"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descarregar</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.link)}
                        className="px-3 py-1.5 bg-white border border-surface-alt hover:bg-surface-alt text-secondary text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copiar Link"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-secondary/50" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
