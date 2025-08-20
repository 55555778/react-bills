import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app: any = await NestFactory.create(AppModule);

  // 开启全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除 DTO 中未定义的字段
      forbidNonWhitelisted: true, // 如果有多余字段直接报错
      transform: true, // 自动类型转换（如字符串转 number）
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('接口文档')
    .setDescription('template')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);
  // 允许所有跨域
  app.enableCors();
  // 👇 设置全局前缀
  app.setGlobalPrefix('api');
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
