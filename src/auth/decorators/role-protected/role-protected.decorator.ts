



import { SetMetadata } from '@nestjs/common';
import { validroles } from 'src/auth/interfaces/valid-roles';


export const META_ROLES = 'roles';

export const RoleProtected = (...args: validroles[]) =>{

    return SetMetadata(META_ROLES, args);
}
