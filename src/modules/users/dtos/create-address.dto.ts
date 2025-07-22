import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  MinLength,
  IsOptional,
  Length,
  IsNumberString,
  IsNumber,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  recipientName?: string;

  @IsOptional()
  @IsPhoneNumber('IR')
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  postalAddress: string;

  @IsNumberString()
  @Length(10, 10)
  @IsOptional()
  postalCode?: string;

  @IsNumber()
  @IsOptional()
  plate?: number;
}
