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
	Product?: string;
	"Company Name"?: string;
	"Web domain"?: webDomain[] | string;
	"Target Audience"?: string;
	Slogan?: string;
	Tagline?: string;
	domainAvailability?: boolean;
	[ key: string ]: string | string[] | boolean | undefined | webDomain[];
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
