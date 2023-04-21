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
  description: string | LogoDescription;
  designBrief: string;
}

export interface UserGenModel {
	_id?: number | ObjectId;
	name: string;
	email: string;
	createdDate?: number;
	generation: Generation[];
}