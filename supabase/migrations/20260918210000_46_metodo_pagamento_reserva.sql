-- ==============================================================================
-- Migração 46: Método de pagamento da caução escolhido no pedido de reserva
--   'mbway' | 'transferencia' | 'dinheiro' (reservas antigas ficam sem valor)
-- ==============================================================================

ALTER TABLE public.reservas
    ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT;

ALTER TABLE public.reservas DROP CONSTRAINT IF EXISTS chk_metodo_pagamento;
ALTER TABLE public.reservas ADD CONSTRAINT chk_metodo_pagamento
    CHECK (metodo_pagamento IS NULL OR metodo_pagamento IN ('mbway', 'transferencia', 'dinheiro'));

NOTIFY pgrst, 'reload schema';
