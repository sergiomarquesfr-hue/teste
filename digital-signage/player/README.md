# OptiSigns Player - Aplicação Desktop

Player desktop para Digital Signage baseado em Electron, compatível com Windows, macOS e Linux.

## Funcionalidades

- ✅ Registro automático de dispositivos
- ✅ Conexão em tempo real via Socket.IO
- ✅ Reprodução de playlists agendadas
- ✅ Suporte a vídeos, imagens e conteúdo HTML
- ✅ Atualizações remotas de conteúdo
- ✅ Comandos remotos (restart, screenshot, etc.)
- ✅ Heartbeat automático
- ✅ Report de erros
- ✅ Modo kiosk
- ✅ Multi-monitor

## Instalação

### Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn

### Passos

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build:win    # Windows
npm run build:linux  # Linux
npm run build:mac    # macOS
```

## Uso

### Iniciar o Player

```bash
# Modo normal
npm start

# Modo desenvolvimento (com DevTools)
npm run dev

# Modo kiosk (tela cheia forçada)
npm start -- --kiosk
```

### Configuração

Na primeira execução, o player solicitará:

1. **URL do Servidor**: Endereço do backend (ex: `http://localhost:5000`)
2. **Código de Ativação**: Código gerado no dashboard para registrar o dispositivo

Ou você pode usar o modo offline para testes.

### Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| F11 | Alternar tela cheia |
| F5 | Recarregar |
| Ctrl+Q | Sair do aplicativo |

## Estrutura de Arquivos

```
player/
├── src/
│   ├── main.js          # Processo principal do Electron
│   ├── renderer.js      # Interface e lógica do player
│   └── player.html      # HTML da interface
├── package.json
└── README.md
```

## Comunicação com o Servidor

### Registro do Dispositivo

O player se registra automaticamente no servidor usando:

```javascript
POST /api/devices/register
{
  "deviceId": "device_abc123",
  "name": "Player-Sala1",
  "platform": "electron",
  "resolution": "1920x1080"
}
```

### Socket.IO Events

**Cliente → Servidor:**
- `register-device`: Registrar dispositivo em um room
- `heartbeat`: Enviar sinal de vida
- `send-command`: Receber comandos do dashboard

**Servidor → Cliente:**
- `schedule:update`: Novo agendamento disponível
- `schedule:remove`: Agendamento removido
- `content:update`: Conteúdo atualizado
- `command`: Comando remoto (restart, screenshot, etc.)

## Recursos Avançados

### Templates com Zonas Múltiplas

O player suporta templates com múltiplas zonas para exibição simultânea de conteúdo:

```javascript
{
  "zones": [
    {
      "id": "zone1",
      "type": "video",
      "position": { "x": 0, "y": 0 },
      "size": { "width": 50, "height": 100 }
    },
    {
      "id": "zone2",
      "type": "html",
      "position": { "x": 50, "y": 0 },
      "size": { "width": 50, "height": 100 }
    }
  ]
}
```

### Métricas de Saúde

O player envia automaticamente:

- CPU usage
- Memory usage
- Storage free
- Temperature (se disponível)
- Current content playing
- Error logs

## Troubleshooting

### Player não conecta ao servidor

1. Verifique se a URL do servidor está correta
2. Certifique-se de que o servidor está rodando
3. Verifique as regras de firewall

### Conteúdo não reproduz

1. Verifique se o formato é suportado (MP4, JPG, PNG, HTML)
2. Verifique permissões de acesso à URL do conteúdo
3. Consulte os logs de erro no DevTools (F12)

### Player trava frequentemente

1. Reduza a resolução do conteúdo
2. Limpe o cache: `Ctrl+Shift+R`
3. Reinicie o player: `Ctrl+Q` e inicie novamente

## Próximos Passos

- [ ] Suporte a widgets (clima, notícias, RSS)
- [ ] Cache offline de conteúdo
- [ ] Agendamento local de fallback
- [ ] Suporte a WebGL para efeitos avançados
- [ ] Remote desktop para troubleshooting
- [ ] Auto-update do player

## Licença

MIT
