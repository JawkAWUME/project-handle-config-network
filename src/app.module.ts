import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { FirewallsModule } from './firewalls/firewalls.module';
import { RoutersModule } from './routers/routers.module';
import { SwitchesModule } from './switchs/switch.module';
import { DashboardModule } from './dashboard/dashboard.module';

// Entities
import { User } from './users/user.entity';
import { Site } from './sites/site.entity';
import { Firewall } from './firewalls/firewall.entity';
import { Router } from './routers/router.entity';
import { Switch } from './switchs/switch.entity';
import { ConfigurationHistory } from './config-history/config-history.entity';
import { AccessLog } from './access-log/access-log.entity';

@Module({
  imports: [
    // Charger .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database MySQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [User, Site, Firewall, Router, Switch, ConfigurationHistory, AccessLog],
        synchronize: config.get<string>('APP_ENV') !== 'production',
        logging: config.get<string>('APP_ENV') === 'development',
      }),
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN
          ? parseInt(process.env.JWT_EXPIRES_IN)
          : '24h',
      },
    }),

    PassportModule,
    AuthModule,
    UsersModule,
    SitesModule,
    FirewallsModule,
    RoutersModule,
    SwitchesModule,
    DashboardModule,
  ],
})
export class AppModule {}
