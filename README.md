# BF Lentes — Sistema de Gestão para Laboratório Óptico

## Stack
- **Backend**: Node.js + Express + **SQLite** (better-sqlite3)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Auth**: JWT (8h de validade)
- **PWA**: vite-plugin-pwa

> O banco SQLite é um único arquivo em `backend/data/bf_lentes.db`.
> Backup = copiar esse arquivo.

## Pré-requisitos
- Node.js 18+
- *(sem banco externo necessário)*

## Configuração

1. Copiar o `.env`:
```bash
cd backend
cp .env.example .env
# editar apenas JWT_SECRET
```

2. Instalar e iniciar (migrations rodam automaticamente na primeira inicialização):
```bash
cd backend
npm install
npm run dev
```

## Rodando o Backend

```bash
cd backend
npm run dev   # desenvolvimento (nodemon)
# ou
npm start     # produção
```

O servidor sobe em `http://localhost:3001`

Login padrão criado automaticamente:
- **Email**: `admin@bflentes.com`
- **Senha**: `admin123`

## Rodando o Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Módulos

| Módulo | Descrição |
|--------|-----------|
| Dashboard | Faturamento mensal, OS abertas, devedores, estoque baixo, gráfico de receita |
| Clientes | Cadastro com código CLI001, histórico de OS vinculado |
| Lentes | Estoque com alerta de estoque mínimo, índice, marca |
| Ordens de Serviço | Receita (OD/OE), armação, lentes, controle de surfaçagem e montagem |
| Financeiro | Contas a pagar/receber, parcelamento, formas de pagamento |
| Relatórios | Faturamento, top lentes, devedores, estoque baixo |
| Impressão OS | Layout profissional para impressão de Ordem de Serviço |

## Estrutura

```
app-estoque/
├── backend/
│   └── src/
│       ├── config/        # Conexão MySQL
│       ├── migrations/    # SQL migrations + runner
│       ├── models/        # Queries ao banco
│       ├── services/      # Regras de negócio
│       ├── controllers/   # Handlers HTTP
│       ├── routes/        # Express Router
│       └── middleware/    # Auth JWT, error handler
└── frontend/
    └── src/
        ├── api/           # Axios instances por módulo
        ├── components/    # ui/ (shadcn) + layout/ + shared/
        ├── context/       # AuthContext (JWT)
        ├── lib/           # utils (cn, formatCurrency, formatDate)
        └── pages/         # Um diretório por módulo
```
