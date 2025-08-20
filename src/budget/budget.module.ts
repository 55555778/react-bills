import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListSchema } from 'src/list/schema/list.schema';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BudgetSchema } from './schema/bugget.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Budget', schema: BudgetSchema },
      { name: 'List', schema: ListSchema },
    ]),
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
