export interface Bean {
  name: string;
  image: string;
  description: string;
  price250: number;
  price500: number;
}

export interface AddOn {
  name: string;
  price: number;
  separate?: boolean;
}

export enum Category {
  coffee = "coffee",
  nonCoffee = "non-coffee",
  specialty = "specialty",
  grub = "grub",
}
