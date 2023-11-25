import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";



export class CreateuserDto{
    
    @IsString()
    @IsEmail()
    email : string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number'
    })@IsString()
    password: string;

    @IsString()
    @MinLength(1)
    fullName: string;
}