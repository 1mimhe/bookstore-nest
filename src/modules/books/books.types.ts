import { BookImageTypes } from './entities/book-image.entity';

export interface CartBook {
  id: string;
  name: string;
  title: {
    slug: string;
  },
  publisher: {
    publisherName: string;
  },
  images: {
    type: BookImageTypes,
    url: string;
  }[],
  stock: number;
  price: number;
  discountPercent: number;
  get finalPrice(): number;
}