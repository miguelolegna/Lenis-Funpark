CREATE TABLE configuracoes_sistema (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    reservas_bloqueadas BOOLEAN NOT NULL DEFAULT false,
    mensagem_bloqueio TEXT NOT NULL DEFAULT 'As reservas encontram-se temporariamente suspensas. Por favor, tente mais tarde.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir a linha única
INSERT INTO configuracoes_sistema (id, reservas_bloqueadas, mensagem_bloqueio) 
VALUES (1, false, 'As reservas encontram-se temporariamente suspensas. Por favor, tente mais tarde.');

-- Políticas RLS
ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver as configuracoes"
ON configuracoes_sistema FOR SELECT
TO public
USING (true);

CREATE POLICY "Apenas admin pode modificar as configuracoes"
ON configuracoes_sistema FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
