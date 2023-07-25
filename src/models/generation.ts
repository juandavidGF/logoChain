import { ObjectId } from 'mongodb';

export interface LogoDescription {
  Why: string;
  Prompt: string;
  [key: string]: string;
}

export interface webDomain {
	domain: string | any;
	available: boolean;
}

export interface DesighBrief {
	product: string;
	companyName: string;
	domains: webDomain[] | string;
	slogan: string;
	tagline: string;
	logoPrompt: string;
	whyTheLogo: string;
}

export interface Generation {
	createdDate: number;
  product: string;
  images: string[];
  description: string;
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
