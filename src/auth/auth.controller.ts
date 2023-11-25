import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateuserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { getuser } from './decorators/get-user.decorators';
import { User } from './entities/user.entity';
import { raw } from './decorators/raw-headers.decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { validroles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createuserDto: CreateuserDto) {
    return this.authService.create(createuserDto);
  }

  @Post('login')
  loginUser(@Body() loginuserdto: LoginUserDto) {
    return this.authService.login(loginuserdto);
  }

  @Get('check-status')
  @Auth()
  checkauthStatus(
    @getuser() user : User
  ){
    return this.authService.checkauthStatus(user);
  }


  @Get('private')
  @UseGuards(AuthGuard()) // revisa si tienes acceso del token
  testingPrivateRoute(
    @Req() request: Express.Request,
    @getuser() user: User,
    @getuser('email') useremail : string, 
    @raw() rawheader : string [],
    ){

    //console.log({user: request.user });

    console.log({user})


    return {
      ok:true,
      message : "hola mundo private",
      user,
      useremail,
      rawheader
    }
  }


  @Get('private2')
  //@SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  @RoleProtected( validroles.superUser)
  privateroute2( @getuser() user: User){
    return {
      ok : true,
      user
    }
  }
  

  
  @Get('private3')
  //@SetMetadata('roles', ['admin', 'super-user'])
  //@UseGuards(AuthGuard(), UserRoleGuard)
  //@RoleProtected( validroles.superUser)
  @Auth(validroles.admin, validroles.superUser)
  privateroute3( @getuser() user: User){
    return {
      ok : true,
      user
    }
  }
}
