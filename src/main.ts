import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  //can inject service into custom validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  //app.set('views', __dirname + '/templates');
  //app.set('view engine', 'jsx');
  //app.engine('jsx', require('./core/template/engine').createEngine());

  await app.listen(process.env.PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
