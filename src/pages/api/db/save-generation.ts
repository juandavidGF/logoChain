// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb';
import { UserGenModel, Generation } from '@/models/generation';
const ObjectId = require('mongodb').ObjectId;
import { processImages } from "@/lib/prepare-image-file-for-upload";

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type Data = {
  name: string
} | any

type ErrorResponse = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
	if(req.method !== 'POST') {
		res.status(405).send({ error: 'Only POST requests allowed' })
		return
	}

	// const body = JSON.parse(req.body)
	const body = req.body;
	// console.log('save-generation#req.body', req.body)

	if (!process.env.MONGO_DB) {
    throw new Error('Invalid environment variable: "MONGO_COLLECTION"');
  }
	if (!process.env.MONGO_COLLECTION) {
    throw new Error('Invalid environment variable: "MONGO_COLLECTION"');
  }

	try {
		const mongoClient = await clientPromise;
		const db = mongoClient.db(process.env.MONGO_DB);
		const collection = db.collection(process.env.MONGO_COLLECTION);

		const {product, images, description, designBrief, logoDescriptionWhy} = body.generation[0];
		
		// const imagesBase64 = await processImages(images);
		// console.log('saveGeneration#imagesBase64', imagesBase64);

		let urlsImgCloudinary: string[] = [];
		try {
			urlsImgCloudinary = await Promise.all(await images.map(async (ulr: any) => {
				const uploadedImage = await cloudinary.uploader.upload(ulr, {
					folder: 'logoChain'
				});
				return uploadedImage.secure_url;
			}));
		} catch (error: any) {
			console.error(error);
			return res
				.status(500)
				.json({ message: error.message, type: "Internal server error" });
		}

		const generation: Generation = {
			createdDate: Date.now(),
			product: product,
			images: urlsImgCloudinary,
			description: description,
			designBrief: designBrief,
			logoDescriptionWhy: logoDescriptionWhy
		}

		const results = await collection.updateOne({ _id: new ObjectId(body._id) },
			{
				$push: {
					generation: generation
				}
			}
		)

		if (results['modifiedCount'] === 0) {
			return res
				.status(500)
				.json({ message: 'User not found', type: "Internal server error" });
		}

		return res.status(200).json({ message: 'Generation saved successfully', type: "Success" });
	} 
	catch (error: any) {
    return res
			.status(500)
			.json({ message: error.message, type: "Internal server error" });
	}
}