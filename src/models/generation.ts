import { ObjectId } from 'mongodb';

export interface LogoDescription {
  Why: string;
  Prompt: string;
  [key: string]: string;
}

export interface DesighBrief {	
	"Company Name"?: string;
	"Web domain"?: string;
	"Target Audience"?: string;
	Slogan?: string;
	Tagline?: string;
	[ key: string ]: string | undefined;
}

export interface Generation {
	createdDate: number;
  product: string;
  images: string[];
  description: string | LogoDescription;
  designBrief: DesighBrief | string;
	logoDescriptionWhy: string;
}

export interface UserGenModel {
	_id?: number | ObjectId;
	name: string;
	email: string;
	createdDate?: number;
	generation: Generation[];
}
