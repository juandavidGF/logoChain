// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb';
import { Generation } from '../../../models/generation';
const ObjectId = require('mongodb').ObjectId;

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


		const {product, images, description, designBrief} = body.generation[0];

		const generation: Generation = {
			creationDate: Date.now(),
			product: product,
			images: images,
			description: description,
			designBrief: designBrief
		}

		console.log('save-generation#input -> generation: ', generation);
		

		const results = await collection.updateOne({ _id: new ObjectId(body.id) },
			{
				$push: {
					generation: generation
				}
			}
		)

		res.status(200).json({ message: 'Generation saved successfully', type: "Success" });
	} 
	catch (error: any) {
    return res
        .status(500)
        .json({ message: error.message, type: "Internal server error" });
	}
}