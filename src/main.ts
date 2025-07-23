import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    // Enable CORS if needed
    app.enableCors();
    
    await app.init();
    cachedApp = expressApp;
  }
  return cachedApp;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(app => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Application is running on port ${port}`);
    });
  });
}

// Export for Vercel serverless
export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res);
};