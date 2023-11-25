import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";



@Entity({name:'product_images'})
export class ProductoImagen{

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url:string;

    @ManyToOne(
        ()=> Product,
        (product) => product.imagen,
        {onDelete : 'CASCADE'}
    )
    product:Product
}