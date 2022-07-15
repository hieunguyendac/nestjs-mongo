import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

export class SearchFilter {
  @ApiProperty({
    required: false,
    default: 1,
  })
  @IsNumberString()
  @IsOptional()
  page?: number;

  @ApiProperty({
    required: false,
    default: 20,
  })
  @IsNumberString()
  @IsOptional()
  size?: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  fullTextSearch?: string;
}
