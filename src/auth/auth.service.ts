import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateuserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { jwtpayload } from './interfaces/jwt-payload.interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly  userRepository : Repository<User>,
    private readonly jwtservice : JwtService,
  ){

  }

  async create(createuserDto: CreateuserDto) {
    try {

      const {password, ...userdata} = createuserDto;

      const user = this.userRepository.create({
        ...userdata, 
        password: bcrypt.hashSync(password, 10)
      });
      
      await this.userRepository.save(user);

      return {
        ...user,
        token: this.getJwtoken({id : user.id ,email: user.email})
      };

    } catch (error) {
      this.errores(error);
    }
  }



  async login(loginuserdto : LoginUserDto){

    const {password , email} = loginuserdto;

    const user = await this.userRepository.findOne({
      where : {email},
      select: { email: true, password:true, id:true}
    });

    if (!user)
      throw new UnauthorizedException(`no existe el usuario`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Constraseña incorrecta`);

    return {
      ...user,
      token: this.getJwtoken({id : user.id, email: user.email})
    };
  }


  async checkauthStatus(user: User){
    return {
      ...user,
      token: this.getJwtoken({id : user.id, email: user.email})
    };
  }



  //metodo tokeon
  private getJwtoken(payload: jwtpayload){

    const token = this.jwtservice.sign(payload);

    return token;
    //
  }



  private errores(error : any) : never{

    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    console.log(error)
    throw new InternalServerErrorException('Please check server logs');

    
  }
}
