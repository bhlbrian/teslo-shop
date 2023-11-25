import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { paginationDto } from '../cammon/dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { validroles } from 'src/auth/interfaces/valid-roles';
import { getuser } from 'src/auth/decorators/get-user.decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  create(
    @Body() createProductDto: CreateProductDto,
    @getuser() user: User,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationdto: paginationDto) {
    return this.productsService.findAll(paginationdto);
  }

  @Get(':id')
  findOne(@Param('id', ) id: string) {
    return this.productsService.findoneplain(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @getuser() user: User) {
    return this.productsService.update(id, updateProductDto,user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
