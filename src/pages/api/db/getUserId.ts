// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const ObjectId = require('mongodb').ObjectId;
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb';

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

	const body = req.body;

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

		// console.log('getUserId#input -> body.email: ', body.email);
		
		const response = await collection
			.find({email: body.email})
			.toArray();

		const user = response[0]
		const id = user._id;
		// console.log('getUserId#output -> id: ', id);

		res.status(200).json({ userId: id });
	} 
	catch (error: any) {
    return res
        .status(500)
        .json({ message: error.message, type: "Internal server error" });
	}
}