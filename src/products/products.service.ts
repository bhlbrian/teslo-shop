import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { paginationDto } from '../cammon/dto/pagination.dto';
import {validate as isUUID} from 'uuid'
import { ProductoImagen } from './entities/product-images.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('PrProductsServiceo')

  constructor(

    @InjectRepository(Product)
    private readonly producRepository : Repository<Product>,
    @InjectRepository(ProductoImagen)
    private readonly producimagenrepository : Repository<ProductoImagen>,

    private readonly datasource : DataSource,
  ){}  

  
  async create(createProductDto: CreateProductDto, user : User) {

    try {

      const { imagen = [], ...productDetails } = createProductDto;

      const producto = this.producRepository.create({
        ...productDetails,
        imagen: imagen.map(image => this.producimagenrepository.create({url:image})),
        user : user
      });

      await this.producRepository.save(producto);

      return {...producto, imagen};
      
    } catch (error) {
      this.handleExceptions(error);
    }

  }


/////Paginar
  async findAll(paginationDto: paginationDto) {
    const { limit = 10 , offset = 0} = paginationDto;
    const productos =await this.producRepository.find({
      take: limit,
      skip: offset,
      relations:{
        imagen: true,
      }
    });
    return productos.map(product=>({
      ...product,
      imagen: product.imagen.map(img => img.url)
    }))
  }


  async findOne(id: string) {
    let producto: Product;

    if (isUUID(id)){
      producto = await this.producRepository.findOneBy({id:id});
    }
    else{
      const query = this.producRepository.createQueryBuilder('prod');
      producto = await query.where('UPPER(title) =:title or slug=:slug', {
        title : id.toUpperCase(),
        slug: id.toLowerCase(),
      }).leftJoinAndSelect('prod.imagen', 'prodImagen').getOne();
      //producto = await this.producRepository.findOneBy({slug:id})
    }

    if(!producto)
      throw new NotFoundException(`No se encontro el producto con el id ${id}`);

    return producto
  }

  async findoneplain(term: string){
    const { imagen = [], ...rest} = await this.findOne(term);
    return{
      ...rest,
      imagen: imagen.map(image => image.url)
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto, user : User) {

    const {imagen, ...toupdate} = updateProductDto;

    const producto = await this.producRepository.preload({
      id:id,
      ...toupdate,
    })
    if (!producto)
      throw new NotFoundException(`no existe el producto ${id}`)

    // crear query runner
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {

      if (imagen){
        await queryRunner.manager.delete(ProductoImagen, { product: {id}});
        producto.imagen = imagen.map(image => this.producimagenrepository.create({url:image}))
      }else{

      }
      producto.user = user;
      
      await queryRunner.manager.save(producto);

      await queryRunner.commitTransaction();

      await queryRunner.release();

      //await this.producRepository.save(producto);
      
      return this.findoneplain(id);
      
    } catch (error) {

      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      this.handleExceptions(error);
    }
  }


  
  
  async remove(id: string) {
    const producto = await this.findOne(id);
    await this.producRepository.remove(producto);
  }



  private handleExceptions(error: any){
    if (error.code === '23505')
        throw new BadRequestException(error.detail)
      this.logger.error(error);
      throw new InternalServerErrorException("Rebie los logs");
  }

  //// para eliminar todo
  async deleteallproductos(){
    const query = this.producRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
