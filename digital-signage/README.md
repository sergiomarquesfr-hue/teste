# 🖥️ Sistema Digital Signage Completo - Clone OptiSigns

Sistema completo de Digital Signage com todas as funcionalidades do OptiSigns, incluindo backend, dashboard web, aplicativo mobile e player desktop.

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [API Reference](#-api-reference)
- [Estrutura do Projeto](#-estrutura-do-projeto)

## ✨ Funcionalidades

### Backend (Node.js/Express)

- ✅ **Autenticação & Autorização**
  - Login/Register de usuários
  - JWT tokens
  - Middleware de autenticação
  - Controle de acesso por função

- ✅ **Gerenciamento de Conteúdo**
  - Upload de vídeos, imagens, HTML
  - Biblioteca de mídia
  - Preview de conteúdo
  - Metadados e tags

- ✅ **Gestão de Dispositivos/Telas**
  - Registro automático de players
  - Monitoramento em tempo real
  - Heartbeat automático
  - Métricas de saúde (CPU, memória, storage)
  - Report de erros

- ✅ **Playlists**
  - Criação e edição
  - Ordem de reprodução
  - Duração por item
  - Transições

- ✅ **Agendamento (Schedule)**
  - Agendamento por data/hora
  - Dias da semana
  - Prioridade
  - Por tela ou grupo
  - Duplicação de agendamentos

- ✅ **Grupos de Telas**
  - Organização por localização/departamento
  - Ações em massa
  - Estatísticas por grupo
  - Busca geoespacial

- ✅ **Templates**
  - Layouts multi-zonas
  - Templates pré-definidos
  - Customização completa
  - Aplicação rápida

- ✅ **Analytics & Relatórios**
  - Dashboard de métricas
  - Status de telas
  - Histórico de reprodução
  - Exportação de dados
  - Eventos em tempo real

- ✅ **Comunicação em Tempo Real**
  - Socket.IO
  - Atualizações push
  - Comandos remotos
  - Heartbeat

### Player Desktop (Electron)

- ✅ Multi-plataforma (Windows, macOS, Linux)
- ✅ Modo kiosk
- ✅ Registro automático
- ✅ Reprodução offline
- ✅ Cache de conteúdo
- ✅ Atualizações remotas
- ✅ Comandos remotos (restart, screenshot)
- ✅ Suporte a múltiplos monitores
- ✅ Templates com zonas múltiplas
- ✅ Relatório de erros automático

### Dashboard Web (React/Vite)

- ✅ Interface moderna e responsiva
- ✅ Drag-and-drop para playlists
- ✅ Visualização em tempo real
- ✅ Gerenciamento completo
- ✅ Analytics visual

### Mobile App (React Native)

- ✅ Monitoramento remoto
- ✅ Notificações push
- ✅ Controle básico
- ✅ Visualização de analytics

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌──────────────────┐
│   Dashboard     │     │   Mobile App     │
│   (React/Vite)  │     │  (React Native)  │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │         ┌─────────────▼──────────────┐
         │         │      Backend API           │
         │         │    (Node.js/Express)       │
         │         │                            │
         │         │  - REST API                │
         │         │  - Socket.IO Server        │
         │         │  - MongoDB                 │
         └─────────►                            │
                   │                            │
         ┌─────────▼────────────────────────────┘
         │
         │
┌────────▼────────┐
│   Player App    │
│    (Electron)   │
│                 │
│ - Windows       │
│ - macOS         │
│ - Linux         │
└─────────────────┘
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ 
- MongoDB 4.4+
- npm ou yarn

### 1. Clonar Repositório

```bash
cd /workspace/digital-signage
```

### 2. Backend

```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar servidor
npm start
```

### 3. Dashboard Web

```bash
cd dashboard
npm install
npm run dev
```

### 4. Player Desktop

```bash
cd player
npm install
npm run dev
```

### 5. Mobile App

```bash
cd mobile-app
npm install
npx react-native run-android  # ou run-ios
```

## 📖 Uso

### Primeiros Passos

1. **Inicie o backend**: `cd backend && npm start`
2. **Acesse o dashboard**: `http://localhost:5173`
3. **Crie uma conta** de administrador
4. **Adicione conteúdo** (vídeos, imagens)
5. **Crie uma playlist** com o conteúdo
6. **Crie um agendamento** vinculando a playlist às telas
7. **Instale o player** nas telas físicas
8. **Ative o player** com o código gerado no dashboard

### Fluxo de Reprodução

```
1. Player inicia → Conecta ao servidor
2. Solicita agendamento ativo → Backend retorna playlist
3. Player reproduz itens da playlist → Envia heartbeat
4. Dashboard atualiza agendamento → Notifica player via Socket.IO
5. Player recarrega conteúdo → Continua reprodução
```

## 📡 API Reference

### Autenticação

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Conteúdo

```
GET    /api/content              # Listar conteúdos
POST   /api/content              # Criar/upload
GET    /api/content/:id          # Obter detalhes
PUT    /api/content/:id          # Atualizar
DELETE /api/content/:id          # Excluir
```

### Telas/Dispositivos

```
POST   /api/devices/register     # Registrar player
POST   /api/devices/authenticate # Autenticar
POST   /api/devices/:id/heartbeat # Enviar heartbeat
GET    /api/screens              # Listar telas (dashboard)
PUT    /api/screens/:id          # Atualizar tela
```

### Playlists

```
GET    /api/playlists            # Listar playlists
POST   /api/playlists            # Criar playlist
GET    /api/playlists/:id        # Obter playlist
PUT    /api/playlists/:id        # Atualizar
DELETE /api/playlists/:id        # Excluir
```

### Agendamentos

```
GET    /api/schedules                        # Listar agendamentos
POST   /api/schedules                        # Criar agendamento
GET    /api/schedules/:id                    # Obter agendamento
PUT    /api/schedules/:id                    # Atualizar
DELETE /api/schedules/:id                    # Excluir
POST   /api/schedules/:id/duplicate          # Duplicar
GET    /api/schedules/screen/:id/active      # Agendamento ativo da tela
```

### Grupos de Telas

```
GET    /api/screen-groups           # Listar grupos
POST   /api/screen-groups           # Criar grupo
GET    /api/screen-groups/:id       # Obter grupo
PUT    /api/screen-groups/:id       # Atualizar
DELETE /api/screen-groups/:id       # Excluir
POST   /api/screen-groups/:id/screens # Adicionar telas
GET    /api/screen-groups/:id/stats   # Estatísticas
```

### Templates

```
GET    /api/templates               # Listar templates
POST   /api/templates               # Criar template
GET    /api/templates/:id           # Obter template
PUT    /api/templates/:id           # Atualizar
DELETE /api/templates/:id           # Excluir
POST   /api/templates/:id/duplicate # Duplicar
POST   /api/templates/:id/apply     # Aplicar à tela
```

### Analytics

```
GET    /api/analytics/dashboard     # Dashboard geral
GET    /api/analytics/screens       # Análise de telas
GET    /api/analytics/content       # Análise de conteúdo
GET    /api/analytics/export        # Exportar relatório
```

### Socket.IO Events

**Cliente → Servidor:**
- `register-device`: `{ deviceId }`
- `heartbeat`: `{ deviceId, status }`
- `send-command`: `{ deviceId, command, params }`

**Servidor → Cliente:**
- `schedule:update`: `{ scheduleId }`
- `schedule:remove`: `{ scheduleId }`
- `content:update`: `{ contentId }`
- `command`: `{ command, params }`
- `heartbeat-ack`: `{ timestamp, status }`

## 📁 Estrutura do Projeto

```
digital-signage/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuração DB
│   │   ├── controllers/     # Lógica das rotas
│   │   ├── middleware/      # Auth, upload, etc.
│   │   ├── models/          # Modelos MongoDB
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços externos
│   │   ├── utils/           # Utilitários
│   │   └── index.js         # Entry point
│   └── package.json
│
├── dashboard/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── context/         # Context API
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API client
│   │   └── App.jsx
│   └── package.json
│
├── player/
│   ├── src/
│   │   ├── main.js          # Electron main process
│   │   ├── renderer.js      # Player UI logic
│   │   └── player.html      # Player interface
│   └── package.json
│
├── mobile-app/
│   ├── src/
│   │   ├── screens/         # Telas React Native
│   │   ├── components/      # Componentes
│   │   ├── context/         # Context API
│   │   └── App.js
│   └── package.json
│
└── package.json
```

## 🔧 Tecnologias

| Componente | Tecnologias |
|------------|-------------|
| Backend | Node.js, Express, MongoDB, Socket.IO, JWT |
| Dashboard | React, Vite, TailwindCSS, Axios |
| Player | Electron, Socket.IO-client, node-fetch |
| Mobile | React Native, AsyncStorage |

## 📝 Licença

MIT

## 👥 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de enviar PRs.

---

**Desenvolvido com ❤️ para Digital Signage**
