import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponseDto<T> {
  @ApiProperty({ 
    example: 409, 
    description: 'HTTP status code' 
  })
  statusCode: number;

  @ApiProperty({ 
    description: 'Error message describing the conflict' 
  })
  message: T;

  @ApiProperty({ 
    example: 'Conflict', 
    description: 'Error type' 
  })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: ['phoneNumber must be a valid phone number'],
    description: 'Array of validation errors'
  })
  message: string[];

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error type'
  })
  error: string;
}

export class ConflictDto {
  @ApiProperty({
    example: 'username',
    description: 'The field that caused the conflict'
  })
  field: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The value that caused the conflict'
  })
  value: string;

  @ApiProperty({ 
    example: "Username 'johndoe' is already taken", 
    description: 'Error message describing the conflict' 
  })
  message: string;
}

export class ConflictResponseDto {
  @ApiProperty({
    example: 409,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    type: [ConflictDto],
    description: 'Array of conflict details'
  })
  message: ConflictDto[];

  @ApiProperty({
    example: 'Conflict',
    description: 'Error type'
  })
  error: string;
}