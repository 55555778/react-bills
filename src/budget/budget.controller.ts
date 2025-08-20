import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto, FindBudgetDto } from './dto/create-budget.dto';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post('create')
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetService.create(createBudgetDto);
  }

  @Get('find')
  find(@Query() query: FindBudgetDto) {
    return this.budgetService.findAll(query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.budgetService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
  //   return this.budgetService.update(+id, updateBudgetDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.budgetService.remove(+id);
  // }
}
