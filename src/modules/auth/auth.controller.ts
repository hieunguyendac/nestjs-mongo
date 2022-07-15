import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  public async login(@Body() payload: LoginDto) {
    return await this.authService.login(payload.email, payload.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  public async register(@Body() payload: RegisterDto) {
    return await this.authService.register(payload);
  }
}
