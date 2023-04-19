import { ObjectId } from 'mongodb';

export interface LogoDescription {
  Why: string;
  Prompt: string;
  [key: string]: string;
}

export interface Generation {
	createdDate: number;
  product: string;
  images: string[];
  description: LogoDescription;
  designBrief: string;
}

export interface UserGenModel {
	id?: number | ObjectId;
	name: string;
	email: string;
	createdDate?: number;
	generation: Generation[];
}