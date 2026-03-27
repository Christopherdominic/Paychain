const prisma = require('./config/database');
const createApp = require('./app');

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`PayChain API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
