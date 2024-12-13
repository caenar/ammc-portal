import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';

@Module({
   imports: [
      DatabaseModule,
      forwardRef(() => AuthModule),
      JwtModule.registerAsync({
         useFactory: () => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
         }),
      }),
   ],
   providers: [FinanceService],
   controllers: [FinanceController],
   exports: [FinanceService],
})
export class FinanceModule {}
