import { ObjectId } from 'mongodb';

export interface LogoDescription {
  Why: string;
  Prompt: string;
  [key: string]: string;
}

export interface webDomain {
	domain: string;
	available: boolean;
}

export interface DesighBrief {	
	"Company Name"?: string;
	"Web domain"?: webDomain[];
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
