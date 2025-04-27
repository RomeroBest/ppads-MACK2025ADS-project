# 📌 Projeto: TaskTrackerPro

Sistema web de gerenciamento de tarefas desenvolvido como parte do Projeto de Prática Profissional em ADS da Universidade Presbiteriana Mackenzie.

## 👥 Grupo
**Mack2025ADS**  
Integrantes: Jorge Romero, Raul, Amarildo

---

## 🚀 Funcionalidades Principais

- Login com e-mail e senha
- Login com **conta Google** via OAuth 2.0
- Painel de usuário com:
  - Criação, edição e exclusão de tarefas
  - Campos: título, descrição, prioridade, vencimento, tag e status
  - Filtros por status (pendente, concluída) e tag
  - Interface moderna e responsiva
- Painel **admin**:
  - Listagem e gerenciamento de usuários
  - Alteração de `role` (user/admin)
  - Exclusão de contas

---

## 🧰 Tecnologias Utilizadas

| Camada         | Tecnologias |
|----------------|-------------|
| Frontend       | React + TypeScript + Vite + Tailwind CSS |
| Backend        | Node.js + Express + TypeScript |
| ORM/Database   | Drizzle ORM + MySQL |
| Autenticação   | JWT + Google OAuth (passport-google-oauth20) |
| Compartilhamento de Tipos | `shared/` com Drizzle + Zod |
| Hospedagem     | Local (localhost:5000), preparado para deploy com Vercel/Render |

---

## 📁 Estrutura do Projeto

```
ppads-MACK2025ADS-project/
├── client/       # Frontend React
├── server/       # Backend Node + Express
└── shared/       # Schemas, tipos e validações compartilhadas
```

---

## 🛠️ Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/RomeroBest/ppads-MACK2025ADS-project.git
cd ppads-MACK2025ADS-project
```

### 2. Configure o `.env` nas pastas `server/` e `client/`

#### Exemplo de `.env` no backend (`server/.env`):

```
DATABASE_URL="mysql://root:@localhost:3307/tasktracker"
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
JWT_SECRET=...
```

### 3. Instale e rode o servidor

```bash
cd server
npm install
npm run dev
```

### 4. Instale e rode o frontend

```bash
cd ../client
npm install
npm run dev
```

---

## 🔐 Acesso Administrativo

- Para acessar o painel admin, o usuário precisa estar com o `role = "admin"`.
- O backend contém rotas protegidas com os middlewares `verifyToken` e `isAdmin`.

---

## 📝 Observações

- O projeto usa Drizzle ORM com MySQL. Certifique-se de que seu banco está ativo e compatível com os schemas definidos.
- Migrations devem ser geradas com:
  ```bash
  npx drizzle-kit generate
  npx drizzle-kit migrate
  ```

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
