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
import { PendingChangeModule } from './pending-change/pending-change.module';

@Module({
  imports: [
    // Charger .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database – supporte MySQL en dev, PostgreSQL en production (Render)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('APP_ENV') === 'production';
        const databaseUrl = config.get<string>('DATABASE_URL');
        
        // Si DATABASE_URL est fournie, on l'utilise (Render fournit cette variable)
        if (databaseUrl) {
          return {
            type: isProd ? 'postgres' : 'mysql',
            url: databaseUrl,
            entities: [User, Site, Firewall, Router, Switch, ConfigurationHistory, AccessLog],
            synchronize: false, // jamais en production, mais pour éviter les surprises
            logging: config.get<string>('APP_ENV') === 'development',
            ssl: isProd ? { rejectUnauthorized: false } : false,
            connectTimeout: 30000,                    // ← nouveau
            extra: {                                   // ← nouveau
              max: 20,                                 // max connexions dans le pool
              idleTimeoutMillis: 30000,
            },
          };
        }
        
        // Sinon, on utilise les variables individuelles (environnement local)
        const dbType = config.get<string>('DB_TYPE') || 'mysql';
        return {
          type: dbType as any,
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          entities: [User, Site, Firewall, Router, Switch, ConfigurationHistory, AccessLog],
          synchronize: !isProd,
          logging: config.get<string>('APP_ENV') === 'development',
          // Pour PostgreSQL en local, ssl n'est pas nécessaire
          ...(dbType === 'postgres' && isProd ? { ssl: { rejectUnauthorized: false } } : {}),
        };
      },
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
    PendingChangeModule,
    SitesModule,
    FirewallsModule,
    RoutersModule,
    SwitchesModule,
    DashboardModule,
  ],
})
export class AppModule {}