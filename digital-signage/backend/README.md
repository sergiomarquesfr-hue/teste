# Digital Signage Backend

Backend para sistema de Digital Signage com Node.js, Express e MongoDB.

## Funcionalidades

- Autenticação JWT
- Gerenciamento de usuários
- Upload e gerenciamento de conteúdo (imagens, vídeos, textos)
- Gerenciamento de playlists
- Controle de telas/dispositivos
- Comunicação em tempo real via Socket.IO
- API RESTful

## Pré-requisitos

- Node.js >= 14.x
- MongoDB >= 4.x

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-signage
JWT_SECRET=seu-segredo-jwt-aqui
NODE_ENV=development
```

## Execução

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

## Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contentController.js
│   │   ├── screenController.js
│   │   └── playlistController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Screen.js
│   │   ├── Content.js
│   │   ├── Playlist.js
│   │   └── Device.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── contentRoutes.js
│   │   ├── screenRoutes.js
│   │   └── playlistRoutes.js
│   └── index.js
├── uploads/
├── package.json
└── .env.example
```

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obter perfil do usuário

### Conteúdo
- `POST /api/content` - Criar conteúdo (requer autenticação)
- `GET /api/content` - Listar conteúdos
- `GET /api/content/:id` - Obter conteúdo por ID
- `PUT /api/content/:id` - Atualizar conteúdo (requer autenticação)
- `DELETE /api/content/:id` - Deletar conteúdo (requer autenticação)

### Telas
- `POST /api/screens` - Criar tela (requer autenticação)
- `GET /api/screens` - Listar telas
- `GET /api/screens/:id` - Obter tela por ID
- `PUT /api/screens/:id` - Atualizar tela (requer autenticação)
- `DELETE /api/screens/:id` - Deletar tela (requer autenticação)
- `POST /api/screens/device/heartbeat` - Heartbeat do dispositivo

### Playlists
- `POST /api/playlists` - Criar playlist (requer autenticação)
- `GET /api/playlists` - Listar playlists
- `GET /api/playlists/:id` - Obter playlist por ID
- `PUT /api/playlists/:id` - Atualizar playlist (requer autenticação)
- `DELETE /api/playlists/:id` - Deletar playlist (requer autenticação)

## Socket.IO

O servidor utiliza Socket.IO para comunicação em tempo real com os dispositivos:

- `register-device` - Dispositivo se registra com seu ID
- `heartbeat` - Dispositivo envia heartbeat
- `content-update` - Servidor notifica dispositivo sobre atualização de conteúdo

## License

MIT
