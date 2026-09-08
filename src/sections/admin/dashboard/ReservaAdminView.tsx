export interface ReservaAdminViewProps {
  reserva: any; // usa os dados já carregados no Dashboard
  onClose: () => void;
}

export default function ReservaAdminView({ reserva, onClose }: ReservaAdminViewProps) {
  if (!reserva) return null;

  // Formatação do tipo de convite
  const getTipoConviteLabel = (tipo?: string) => {
    switch (tipo) {
      case 'lenis':
        return 'Convite Lénis';
      case 'tematico':
        return 'Temático';
      case 'nenhum':
      default:
        return 'Nenhum';
    }
  };

  // Formatação do menu
  const getMenuLabel = () => {
    const opcao = reserva.opcao_menu;
    const escolhido = reserva.menu_escolhido;
    if (opcao === 'com_menu' || escolhido === 'MENU_13_50') {
      return 'Com Menu (13,50€)';
    }
    if (opcao === 'sem_menu' || escolhido === 'MENU_11_50') {
      return 'Sem Menu (11,50€)';
    }
    return opcao ? String(opcao) : '—';
  };

  // Extras ativos
  const extras: string[] = [];
  if (reserva.extra_pizza) extras.push('Pizza (+1.50€)');
  if (reserva.extra_cachorro) extras.push('Cachorro (+1.50€)');
  if (reserva.extra_doces) extras.push('Doces (+1.00€)');
  if (reserva.extra_fruta) extras.push('Fruta (+1.00€)');
  if (reserva.extra_gelatina) extras.push('Gelatina (+1.00€)');

  const decoracaoAtiva = Boolean(reserva.decoracao_tematica ?? reserva.decoracao);
  const boloAtivo = Boolean(reserva.inclui_bolo ?? reserva.bolo);
  const termosAceites = Boolean(reserva.termos_veracidade ?? reserva.veracidade_confirmada);

  return (
    <div
      className="fixed inset-0 bg-secondary/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border-2 border-surface-alt max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com título e botão X */}
        <div className="flex items-center justify-between p-6 border-b border-surface-alt bg-surface">
          <div>
            <h2 className="text-xl font-black text-secondary">Formulário da Reserva</h2>
            <p className="text-xs font-semibold text-secondary/60 mt-0.5">
              {reserva.nome_aniversariante || 'Reserva'}
              {reserva.data_evento ? ` • ${new Date(reserva.data_evento).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-surface-alt text-secondary hover:bg-surface-alt hover:text-secondary/80 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer"
            aria-label="Fechar formulário"
          >
            ✕
          </button>
        </div>

        {/* Corpo com as 8 secções em texto estático */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Secção 1 — Dados do Aniversariante */}
          <div className="bg-surface-alt/50 p-5 rounded-2xl border border-surface-alt">
            <h3 className="text-xs font-black uppercase tracking-wider text-secondary/60 mb-3">
              1. Dados do Aniversariante
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="block text-xs font-semibold text-secondary/60">Nome do Aniversariante</span>
                <p className="text-base font-bold text-secondary">{reserva.nome_aniversariante || '—'}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-secondary/60">Idade</span>
                <p className="text-base font-bold text-secondary">
                  {reserva.idade !== null && reserva.idade !== undefined && reserva.idade !== ''
                    ? `${reserva.idade} anos`
                    : '—'}
                </p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-secondary/60">Nº de Crianças</span>
                <p className="text-base font-bold text-secondary">
                  {reserva.num_criancas !== null && reserva.num_criancas !== undefined && reserva.num_criancas !== ''
                    ? reserva.num_criancas
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Secção 2 — Convite Digital */}
          <div className="bg-surface-alt/50 p-5 rounded-2xl border border-surface-alt">
            <h3 className="text-xs font-black uppercase tracking-wider text-secondary/60 mb-3">
              2. Convite Digital
            </h3>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="block text-xs font-semibold text-secondary/60 mb-1">Tipo de Convite</span>
                <span className="inline-block px-3 py-1 bg-white border border-secondary/15 rounded-xl font-bold text-sm text-secondary">
                  {getTipoConviteLabel(reserva.tipo_convite)}
                </span>
              </div>
              {reserva.tipo_convite === 'tematico' && (
                <div>
                  <span className="block text-xs font-semibold text-secondary/60 mb-1">Tema do Convite</span>
                  <p className="text-sm font-bold text-secondary">{reserva.tema_convite || '—'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Secção 3 — Menu */}
          <div className="bg-surface-alt/50 p-5 rounded-2xl border border-surface-alt">
            <h3 className="text-xs font-black uppercase tracking-wider text-secondary/60 mb-2">
              3. Menu
            </h3>
            <p className="text-base font-bold text-secondary">{getMenuLabel()}</p>
          </div>

          {/* Secção 4 — Extras de Menu */}
          <div className="bg-surface-alt/50 p-5 rounded-2xl border border-surface-alt">
            <h3 className="text-xs font-black uppercase tracking-wider text-secondary/60 mb-3">
              4. Extras de Menu
            </h3>
            {extras.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {extras.map((extra) => (
                  <span
                    key={extra}
                    className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-full"
                  >
                    ✓ {extra}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-secondary/50">Sem extras</p>
            )}
          </div>

          {/* Secção 5 — Animação & Decoração */}
          <div className="bg-surface-alt/50 p-5 rounded-2xl border border-surface-alt">
            <h3 className="text-xs font-black uppercase tracking-wider text-secondary/60 mb-3">
              5. Animação & Decoração
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-secondary/60">Decoração Temática</span>
                  <p className="text-sm font-bold text-secondary">
                    {decoracaoAtiva ? 'Sim' : 'Não'}
                    {decoracaoAtiva && reserva.decoracao_tema_nome ? (
                      <span className="ml-1 text-secondary/70 font-normal">({reserva.decoracao_tema_nome})</span>
                    ) : null}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-secondary/60">Pinturas Faciais</span>
                  <p className="text-sm font-bold text-secondary">
                    {reserva.pinturas_faciais ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
              {reserva.outros_servicos && (
                <div className="pt-2 border-t border-surface-alt">
                  <span className="block text-xs font-semibold text-secondary/60">Outros Serviços</span>
                  <p className="text-sm text-secondary mt-0.5 whitespace-pre-wrap">{reserva.outros_servicos}</p>
                </div>
              )}
            </div>
          </div>

          {/* Secção 6 — Bolo de Aniversário */}
          <div className="bg-surface-alt/50 p-5 rounded-2xl border border-surface-alt">
            <h3 className="text-xs font-black uppercase tracking-wider text-secondary/60 mb-3">
              6. Bolo de Aniversário
            </h3>
            <div className="space-y-2">
              <div>
                <span className="block text-xs font-semibold text-secondary/60">Inclui Bolo</span>
                <p className="text-sm font-bold text-secondary">{boloAtivo ? 'Sim' : 'Não'}</p>
              </div>
              {boloAtivo && (
                <div>
                  <span className="block text-xs font-semibold text-secondary/60">Composição / Recheio</span>
                  <p className="text-sm font-medium text-secondary mt-0.5 whitespace-pre-wrap">
                    {reserva.bolo_composicao || '—'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Secção 7 — Notas Adicionais */}
          <div className="bg-surface-alt/50 p-5 rounded-2xl border border-surface-alt">
            <h3 className="text-xs font-black uppercase tracking-wider text-secondary/60 mb-2">
              7. Notas Adicionais
            </h3>
            <p className="text-sm text-secondary font-medium whitespace-pre-wrap">
              {reserva.notas_adicionais || '—'}
            </p>
          </div>

          {/* Secção 8 — Termos */}
          <div className="bg-surface-alt/50 p-5 rounded-2xl border border-surface-alt flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-secondary/60">
                8. Termos
              </h3>
              <p className="text-xs text-secondary/60">Veracidade e aceitação das condições</p>
            </div>
            {termosAceites ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-full">
                Aceites
              </span>
            ) : (
              <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-full">
                Pendentes
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-alt bg-surface flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-secondary text-white text-sm font-bold rounded-xl hover:bg-secondary/90 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
