export interface CartBook {
  id: string;
  name: string;
  title: {
    slug: string;
  },
  publisher: {
    publisherName: string;
  },
  stock: number;
  price: number;
  discountPercent: number;
  get finalPrice(): number;
}