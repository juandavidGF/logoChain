import { ObjectId } from 'mongodb';

export interface Generation {
	creationDate: number;
  product: string;
  images: string[];
  description: string;
  designBrief: string;
}

export interface UserGeneration {
	id: number;
	name: string;
	email: string;
	generation: Generation[];
}