import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';

import { UsersService } from '../users.service';

@ValidatorConstraint({ name: 'IsUserAlreadyExist', async: true })
@Injectable()
export class IsUserAlreadyExist {
  constructor(private readonly usersService: UsersService) {}

  async validate(text: string): Promise<boolean> {
    const user = await this.usersService.findOneByUsername(text);
    return !user;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'validation.users.username_already_exists';
  }
}
