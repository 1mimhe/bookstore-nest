import { PartialType } from '@nestjs/swagger';
import { CreateCollectionBookDto } from './create-collection-book.dto';

export class UpdateCollectionBookDto extends PartialType(CreateCollectionBookDto) {}