### 0.1. Auditoria ao Sistema de Ficheiros

### 1. Árvore de Diretórios (f:\EDC\lenis-funpark2)

```text
f:\EDC\lenis-funpark2
├── .env
├── .gitignore
├── Header.tsx
├── README.md
├── convert.mjs
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── assets/
    ├── components/
    │   ├── FAQ.tsx
    │   ├── ProtectedRoute.tsx
    │   └── layout/
    │       ├── Footer.tsx
    │       ├── Header.tsx
    │       ├── MainLayout.tsx
    │       ├── MapSection.tsx
    │       └── ScrollToTop.tsx
    ├── lib/
    │   └── animations.ts
    ├── pages/
    │   ├── Festas.tsx
    │   ├── Home.tsx
    │   ├── OParque.tsx
    │   └── admin/
    │       ├── Dashboard.tsx
    │       └── Login.tsx
    ├── sections/
    │   ├── admin/
    │   │   └── dashboard/
    │   │       ├── BookingsTableSection.tsx
    │   │       ├── HeaderSection.tsx
    │   │       └── QuotesTableSection.tsx
    │   ├── festas/
    │   │   ├── B2BFacilitadorSection.tsx
    │   │   ├── B2COfertaSection.tsx
    │   │   └── HeroSection.tsx
    │   ├── home/
    │   │   ├── BookingModuleSection.tsx
    │   │   ├── ConvitesDigitaisSection.tsx
    │   │   ├── HeroSection.tsx
    │   │   ├── SemaforoWidgetSection.tsx
    │   │   └── SobrePreviewSection.tsx
    │   └── o-parque/
    │       ├── EquipaSection.tsx
    │       ├── HeroSection.tsx
    │       ├── HistoriaMissaoSection.tsx
    │       └── TourVisualSection.tsx
    └── utils/
```

_(Nota: As pastas `assets` e `utils` estão atualmente vazias ou sem ficheiros estruturais imediatos na análise superficial e as pastas de configuração de dependências de compilador, como `node_modules` e `dist` foram omitidas)._

---

### 2. Padrão de Arquitetura Identificado

O projeto não utiliza um MVC clássico do back-end ou uma Clean Architecture purista, mas segue um padrão **Component-Based / Feature-Sliced Design simplificado** adaptado para Frontend (React/Vite).

Para forçar novo código a respeitar a taxonomia atual, eis as regras arquiteturais extraídas:

- **`src/pages/`**: Servem como "Controladores" de rota. Agrupam a lógica global daquela visualização inteira (ex: `Home.tsx` ou o subset `admin/Dashboard.tsx`).
- **`src/sections/`**: Fragmentam o código e a UI de cada página em pequenos blocos independentes. A organização interna respeita **rigorosamente a organização das páginas** (ex: o que está em `pages/home` tem os seus sub-blocos lógicos alocados na sub-pasta `sections/home`).
- **`src/components/`**: Reservado a **elementos partilhados/reutilizáveis globalmente** (ex: `FAQ.tsx`), bem como peças da infraestrutura e layout visual do ecrã (`layout/Header.tsx`, `layout/Footer.tsx`).
- **`src/lib/` (e potencialmente `utils/`)**: Onde devem ser colocados os blocos utilitários não atrelados à interface de utilizador, facilitadores e integrações (ex: `animations.ts`).

---

### 3. Ficheiros Estruturais de Configuração

Foi detetada a presença simultânea de ferramentas modernas de compilação e _linting_, especificamente:

- **Compilador e Tipagem Forte**: Existem as diretrizes para TypeScript suportadas pelo Vite no root:
  - `tsconfig.json` (entrypoint base)
  - `tsconfig.app.json` (configurações exclusivas da aplicação frontend)
  - `tsconfig.node.json` (definições dedicadas à interação com Node para _build tools_, ex: `vite.config.ts`)

- **Linter de Código**: A qualidade de formatação está mapeada num sistema moderno de config do ESLint:
  - `eslint.config.js` (formato moderno _Flat Config_, que dita as regras em projetos da mais recente geração).

### 0.2. Mapeamento de Dependências

- **Framework de Servidor HTTP**: Não existe framework de servidor (Node.js) nativo instalado (ex: Express, Fastify, NestJS). Trata-se de uma aplicação puramente de cliente (Frontend SPA) baseada em React (v19), cujo servidor de desenvolvimento e processo de agregação é suportado pelo **Vite** (v8.0.12).
- **Motores Relacionais e ORMs**: Não foram detetados ORMs tradicionais locais (ex: Prisma, TypeORM, Sequelize). Em alternativa, o projeto consome a SDK do **Supabase** (`@supabase/supabase-js` v2.108.2), utilizando-o como _Backend-as-a-Service_ principal. Isto permite operações de Query Builder diretamente contra o PostgreSQL da Cloud, sem necessidade de ORM na aplicação.
- **Processamento Gráfico, Criptografia e SMTP**: O projeto **não possui** bibliotecas de processamento pesado de imagem (como `sharp`), bibliotecas de cifras criptográficas locais ou JWT (como `bcrypt` ou `jsonwebtoken`), nem integradores nativos de correio eletrónico (como `nodemailer`). Toda a segurança, envio de mails ou redimensionamento de imagens será inevitavelmente delegada ao Backend/Serviço externo (ex: o próprio Supabase).

### 0.3. Análise de Configurações e Ambiente

- **Variáveis de Ambiente (`.env`)**: Foram identificadas e encontram-se parametrizadas em memória as chaves de integração exclusivas do Backend-as-a-Service:
  - `VITE_SUPABASE_URL`
  - `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_ANON_KEY`
- **Motor de Base de Dados Relacional**: Não existem *connection strings* tradicionais (`postgresql://` ou `mysql://`). Uma vez que o serviço ativo está delegado ao Supabase, a arquitetura exige invariavelmente uma base de dados **PostgreSQL**, sendo os acessos feitos via cliente API (sem conexão de socket direto à base de dados no Frontend).
- **Portas de Rede e Políticas de CORS**: A configuração de servidor (`vite.config.ts`) encontra-se com o comportamento *default*. **Não há portas fixas ou regras explícitas de CORS** (ausência do objeto `server`). Localmente usará a porta standard do Vite (`5173`). Quaisquer restrições rigorosas de *Cross-Origin Resource Sharing* devem estar configuradas do lado do servidor do Supabase ou na Cloud de alojamento.