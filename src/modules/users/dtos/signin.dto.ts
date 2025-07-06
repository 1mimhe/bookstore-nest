import {
  IsString,
  IsNotEmpty,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  ValidationArguments,
  isEmail,
  isMobilePhone,
  isAlphanumeric,
} from 'class-validator';

@ValidatorConstraint({ name: 'isUsernameOrEmailOrPhone', async: false })
export class IsUsernameOrEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (!value || typeof value !== 'string') {
      return false;
    }

    if (isEmail(value) || isMobilePhone(value) || isAlphanumeric(value)) {
      return true;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Identifier must be a valid username (alphanumeric), email, or phone number';
  }
}

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsUsernameOrEmailOrPhoneConstraint)
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
