import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Publisher } from './entities/publisher.entity';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';
import { Roles } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { CreatePublisherDto } from './dtos/create-publisher.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdatePublisherDto } from './dtos/update-publisher.dto';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { DBErrors } from 'src/common/enums/db.errors';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher) private publisherRepo: Repository<Publisher>,
    private authService: AuthService
  ) {}

  async signup(publisherDto: CreatePublisherDto): Promise<Publisher | never> {
    const { publisherName, slug, description, logoUrl, ...userDto } = publisherDto;
    
    return this.authService.signup(
      userDto,
      [Roles.Publisher],
      async (user: User, manager: EntityManager) => {
        const publisher = manager.create(Publisher, {
          userId: user.id,
          user: user,
          publisherName,
          slug,
          description,
          logoUrl
        });
        return manager.save(publisher).catch((error) => {
          if (error.code === DBErrors.Conflict) {
            throw new ConflictException(ConflictMessages.PublisherName);
          }
          throw error;
        });;
      }
    );
  }

  async getById(id: string, relations?: string[]): Promise<Publisher | never> {    
    return this.publisherRepo.findOneOrFail({
      where: { id },
      relations
    }).catch((error: Error) => {
      if (EntityNotFoundError) {
        new NotFoundException(NotFoundMessages.Publisher);
      }
      throw error;
    });
  }

  async getBySlug(slug: string): Promise<Publisher | never> {
    return this.publisherRepo.findOneOrFail({
      where: { slug },
      relations: ['books.translators', 'books.title.authors']
    }).catch((error: Error) => {
      if (EntityNotFoundError) {
        new NotFoundException(NotFoundMessages.Publisher);
      }
      throw error;
    });;
  }

  async update(id: string, publisherDto: UpdatePublisherDto): Promise<Publisher | never> {
    const publisher = await this.getById(id);
    Object.assign(publisher, publisherDto);
    return this.publisherRepo.save(publisher).catch((error) => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.PublisherName);
      }
      throw error;
    });
  }
}
