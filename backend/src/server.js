const { initDb } = require('./config/db');
const migrate = require('./migrations/runner');
const { createDefaultAdmin } = require('./services/authService');

const PORT = process.env.PORT || 3001;

async function start() {
  await initDb();
  migrate();
  createDefaultAdmin();

  const app = require('./app');
  app.listen(PORT, () => {
    console.log(`BF Lentes API rodando na porta ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Falha ao iniciar:', err);
  process.exit(1);
});
