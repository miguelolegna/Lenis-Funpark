CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE estado_reserva AS ENUM (
    'PENDING_APPROVAL', 
    'AWAITING_DEPOSIT', 
    'IN_PROGRESS', 
    'LOCKED', 
    'COMPLETED'
);

CREATE TYPE tipo_menu AS ENUM (
    'MENU_11_50', 
    'MENU_13_50'
);

CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estado estado_reserva DEFAULT 'PENDING_APPROVAL',
    data_evento TIMESTAMPTZ NOT NULL,
    contacto_cliente TEXT NOT NULL,
    nome_aniversariante TEXT NOT NULL,
    idade INTEGER NULL,
    num_criancas INTEGER NULL,
    menu_escolhido tipo_menu NULL,
    convite_lenis BOOLEAN DEFAULT false,
    extra_pizza BOOLEAN DEFAULT false,
    extra_doces BOOLEAN DEFAULT false,
    decoracao BOOLEAN DEFAULT false,
    bolo BOOLEAN DEFAULT false,
    bolo_composicao TEXT NULL,
    notas_adicionais TEXT NULL,
    veracidade_confirmada BOOLEAN DEFAULT false,
    assinatura_ip TEXT NULL,
    assinatura_timestamp TIMESTAMPTZ NULL
);