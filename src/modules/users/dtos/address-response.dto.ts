import { Expose } from 'class-transformer';

export class AddressResponseDto {
  @Expose()
  recipientName?: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  country: string;

  @Expose()
  province: string;

  @Expose()
  city: string;

  @Expose()
  postalAddress: string;

  @Expose()
  postalCode?: string;

  @Expose()
  plate?: number;
}
