import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const database = configService.get('MONGO_DATABASE');
        const host = configService.get('MONGO_HOST');
        const port = configService.get('MONGO_PORT');
        const isDocker = configService.get('IS_DOCKER');
        
        return {
          uri: `mongodb://${username}:${password}@${isDocker === 'true' ? 'mongodb' : host}:${port}`,
          dbName: database,
        };
      },
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
