import { Controller, Get, Post, Param, UploadedFile, 
  UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/filefilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/filenamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService, 
    private readonly configservice : ConfigService
    
    ) {}


  @Get('product/:imageName')
  findproductImage(@Res() res: Response, @Param('imageName') imageName : string){
    
    const path = this.filesService.getStaticProductImage(imageName);
    
    res.sendFile(path);

    
  }




  @Post('product')
  @UseInterceptors( FileInterceptor ('file', {
    fileFilter: fileFilter,
   // limits: {fileSize: 1000}
    storage: diskStorage({
      destination:'./static/products',
      filename : fileNamer
    })
  }))

  uploadfile( @UploadedFile() file : Express.Multer.File,){

    if (!file){
      throw new BadRequestException('La imagen no fue cargada o no es el correcto')
    }

    const secureurl = `${this.configservice.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureurl
    };
  }

}
