import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ConflictDto } from 'src/common/dtos/error.dtos';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  findOne(id: string) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['contact', 'roles']
    });
  }

  async checkUniqueConstraints(
    username?: string,
    phoneNumber?: string,
    email?: string,
  ) {
    const conflicts: ConflictDto[] = [];
    const whereConditions: FindOptionsWhere<User>[] = [];

    if (username) {
      whereConditions.push({ username });
    }

    if (email) {
      whereConditions.push({ contact: { email } });
    }

    if (phoneNumber) {
      whereConditions.push({ contact: { phoneNumber } });
    }

    const existingUsers = await this.userRepo.find({
      where: whereConditions,
      select: ['id', 'username'],
      relations: ['contact'],
    });

    if (existingUsers.length === 0) {
      return conflicts;
    }

    for (const user of existingUsers) {
      if (username && user.username === username) {
        conflicts.push({
          field: 'username',
          value: username,
          message: `Username '${username}' is already taken`,
        });
      }

      if (email && user.contact?.email === email) {
        conflicts.push({
          field: 'email',
          value: email,
          message: `Email '${email}' is already registered`,
        });
      }

      if (phoneNumber && user.contact?.phoneNumber === phoneNumber) {
        conflicts.push({
          field: 'phoneNumber',
          value: phoneNumber,
          message: `Phone number '${phoneNumber}' is already registered`,
        });
      }
    }

    return conflicts;
  }

  findByIdentifier(identifier: string) {
    const whereConditions: FindOptionsWhere<User>[] = [
      { username: identifier },
      { contact: { email: identifier } },
      { contact: { phoneNumber: identifier } },
    ];

    return this.userRepo.findOne({
      where: whereConditions,
      select: ['id', 'username', 'hashedPassword'],
      relations: ['contact'],
    });
  }
}
