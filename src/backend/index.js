// Arquivo principal do backend do SMAN
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const initMqttService = require("./services/mqttService")
// ============================================================================
// Importa as rotas
const configRoutes = require('./routes/configRoutes');
const telemetriaRoutes = require('./routes/telemetriaRoutes');
// ============================================================================

// Carrega variáveis de ambiente (Docker e desenvolvimento local)
require('dotenv').config();

// Importa as configurações de banco de dados
const connectMongo = require('./config/mongoConfig');
const pgPool = require('./config/pgConfig');

// Inicializa aplicação Express
const app = express();

// Cria o servidor HTTP e o Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// Middleware para parsear JSON
app.use(express.json());

// Função para inicializar conexões com os bancos de dados
async function initDatabases() {
  await connectMongo();
  // Testa a conexão com PostgreSQL
  try {
    await pgPool.query('SELECT NOW()');
    console.log('Conexão com PostgreSQL estabelecida com sucesso.');

    // Inicializa o MQTT acessando o socket.IO
    initMqttService(io);
  } catch (error) {
    console.error('Erro ao conectar com PostgreSQL:', error);
  }
}
// Iniciar conexões com os bancos de dados
initDatabases();

// Rotas HTTP de Teste
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    servico: 'Backend do SMAN operando via Docker'
  });
});

// ============================================================================
// Rotas de API
// ============================================================================
app.use('/api', configRoutes); 
// INSERÇÃO DE DADOS MOCKADOS DE TELEMETRIA (POST)
app.use('/api/', telemetriaRoutes);
// ============================================================================

// Conexão Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta http://localhost:${PORT}`);
});
console.log('Backend do SMAN iniciado com sucesso!');
