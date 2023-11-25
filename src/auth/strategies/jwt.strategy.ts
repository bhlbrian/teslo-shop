

import { PassportStrategy} from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { jwtpayload } from '../interfaces/jwt-payload.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
    @InjectRepository(User)
    private readonly userrepository : Repository<User>,
    configservice: ConfigService
    ){
        super({
            secretOrKey: configservice.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }
    

    async validate( paload : jwtpayload): Promise<User>{

        const {id} = paload;

        const user  = await this.userrepository.findOneBy({id});

        if (!user)
            throw new UnauthorizedException('token no valido')

        if(!user.isActive)
            throw new UnauthorizedException('usuario inactivo')


        return user;
    }
}