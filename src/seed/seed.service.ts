import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {

  constructor(
    private readonly productoservice : ProductsService,

    @InjectRepository(User)
    private readonly userreposity : Repository<User>,
  
    ){}

  async runseed(){

    await this.deletetable();

    const adminuser = await this.insertUser();

    await this.insertnewproductos(adminuser);

    return 'ingreso';
  }


  private async deletetable(){
    await this.productoservice.deleteallproductos();

    const query = this.userreposity.createQueryBuilder();

    await query.delete().where({}).execute()


  }


  private async insertUser(){

    const seeduser = initialData.users;

    const users : User[] =[];

    seeduser.forEach(user => {
      users.push(this.userreposity.create(user))
    });

    const dbuser = await this.userreposity.save(seeduser)

    return dbuser[0];

  }


  private async insertnewproductos(user: User){
    await this.productoservice.deleteallproductos();

    const productos= initialData.products;

    const insertpromise = [];

    productos.forEach(product =>{
      insertpromise.push(this.productoservice.create(product,user));
    });

    await Promise.all(insertpromise);

    return true;
  }
}
