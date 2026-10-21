import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const PORT = env.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log('📦 Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();