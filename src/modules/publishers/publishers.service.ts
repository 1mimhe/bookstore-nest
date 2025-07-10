import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Publisher } from './entities/publisher.entity';
import { EntityManager, Repository } from 'typeorm';
import { AuthService } from '../users/auth.service';
import { Roles } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { CreatePublisherDto } from './dtos/create-publisher.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher) private publisherRepo: Repository<Publisher>,
    private authService: AuthService
  ) {}

  async signupPublisher(publisherDto: CreatePublisherDto): Promise<Publisher> {
    const { publisherName, slug, description, ...userDto } = publisherDto;
    
    return this.authService.signup(
      userDto,
      [Roles.Publisher],
      async (user: User, manager: EntityManager) => {
        const publisher = manager.create(Publisher, {
          userId: user.id,
          user: user,
          publisherName,
          slug,
          description
        });
        return manager.save(publisher);
      }
    );
  }
}
