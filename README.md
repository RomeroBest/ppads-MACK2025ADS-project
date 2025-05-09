# 📌 Projeto: TaskTrackerPro

Sistema web de gerenciamento de tarefas desenvolvido como parte do Projeto de Prática Profissional em ADS da Universidade Presbiteriana Mackenzie.

---

## 👥 Grupo **Mack2025ADS**

| Integrante   | GitHub                                       |
| ------------ | -------------------------------------------- |
| Jorge Romero | [@RomeroBest](https://github.com/RomeroBest) |
| Raul         | —                                            |
| Amarildo     | —                                            |

---

## 🚀 Funcionalidades **(v 4 – maio / 2025)**

| Módulo                | Novidades                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Autenticação**      | \* Login local (e‑mail & senha)\n\* Login com **Google OAuth 2.0** (passport‑google‑oauth20)\n\* Cookies de sessão seguros (`SameSite=None; Secure`)   |
| **Tarefas**           | \* CRUD completo\n\* Filtros por **status**, **tag** e **busca**\n\* Prioridade, data de vencimento & descrição                                        |
| **Admin Dashboard**   | \* Visão geral de contagem (total, admins, Google, locais)\n\* **User Management** (editar, excluir)\n\* **Role Management** – delegar ⁄ revogar admin |
| **Perfil & Settings** | \* Atualizar dados pessoais\n\* Alterar senha\n\* Preferências de notificação                                                                          |
| **Logs & Métricas**   | Logs server‑side expostos no panel da Render                                                                                                           |

---

## 🧰 Tecnologias

| Camada           | Stack                                                   |
| ---------------- | ------------------------------------------------------- |
| **Frontend**     | React + TypeScript • Vite • Tailwind CSS                |
| **Backend**      | Node.js • Express • TypeScript                          |
| **ORM / DB**     | Drizzle‑ORM 2 + **PostgreSQL 15** (Render)              |
| **Autenticação** | **Express‑Session** + Cookies • Passport (JWT opcional) |
| **Hospedagem**   | **Render** (web‑service + PostgreSQL)                   |
| **Dev Tools**    | Vite, tsx, eslint, prettier, HeidiSQL (admin DB)        |

---

## 📁 Estrutura

```text
ppads‑MACK2025ADS‑project/
├── client/      # React SPA
├── server/      # API REST + Auth
└── shared/      # Schemas Drizzle + validações Zod
```

---

## ⚙️ Variáveis de Ambiente

### `server/.env`

```env
# PostgreSQL (Render – External URL)
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/ppads_mack2025ads_project

# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
APP_URL=https://ppads‑mack2025ads‑project.onrender.com

# Sessão
SESSION_SECRET=suaChaveSuperSecreta
NODE_ENV=production
```

### `client/.env`

```env
VITE_API_BASE=https://ppads‑mack2025ads‑project.onrender.com
```

---

## 🛠️ Executando Localmente

```bash
# 1. clone
$ git clone https://github.com/RomeroBest/ppads-MACK2025ADS-project.git
$ cd ppads-MACK2025ADS-project

# 2. backend
$ cd server && npm i
$ cp .env.example .env   # edite com seus valores
$ npm run dev            # http://localhost:5000

# 3. frontend
$ cd ../client && npm i
$ cp .env.example .env   # aponte para http://localhost:5000
$ npm run dev            # http://localhost:5173
```

> 💡  Utilize **HeidiSQL** (ou psql) se quiser inspecionar o banco local/Render.

---

## 🗃️ Migrations (Drizzle)

```bash
npx drizzle-kit generate # gera SQL na pasta drizzle
npx drizzle-kit migrate  # aplica no banco indicado em DATABASE_URL
```

---

## 🏷️ Tags

* **v1** – Iteração 1 (MVP CRUD)
* **v2** – Iteração 2 (Google OAuth + Dashboard inicial)
* **v3** – Hotfixes & refactor para Drizzle‑ORM
* **v4** – Segurança de sessão, deploy Render, Admin Dashboard completo ✅ (**current**)

---

## 🔐 Acesso Administrativo

Para acessar `/admin` o usuário precisa ter `role = 'admin'`. A troca de role pode ser feita:

1. Via HeidiSQL (`UPDATE users SET role='admin' WHERE email='...'`)
2. Pelo próprio painel Admin (**Role Management → Delegate Admin**).

Rotas protegidas usam os middlewares `passport.authenticate('session')` + `isAdmin`.

---

## 📝 Licença

Distribuído sob a licença [MIT](LICENSE).
