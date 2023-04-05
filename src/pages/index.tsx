import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from "react";
import cn from "classnames";

const inter = Inter({ subsets: ['latin'] })


interface ImageData {
  url: string;
}

export default function Home() {
	const [product, setProduct] = useState("");
	const [loading, setLoading] = useState(false);
	const [images, setImages] = useState<string[]>([]);
	const [canShowImage, setCanShowImage] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const showLoadingState = loading || (images && !canShowImage);

	const handleSubmit =  async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);

		console.log('handleSubmit#prompt', product)

		const payload_company = {
			chain: "company_name",
			prompt: product
		}

		const company_name_json = await (await fetch("/api/chat", {
			method: "POST",
			body: JSON.stringify(payload_company),
		})).json();

		// console.log('handleSubmit#company_name_json', company_name_json)

		const company_name = company_name_json.result['content'];
		
		setName(company_name);

		const payload_description = {
			chain: "company_logo_description",
			prompt: company_name
		}

		const company_logo_description_json = await (await fetch("/api/chat", {
			method: "POST",
			body: JSON.stringify(payload_description),
		})).json();

		const company_logo_description = company_logo_description_json.result['content'];
		
		setDescription(company_logo_description);


		const image_json = await (await fetch("/api/image", {
			method: "POST",
			body: JSON.stringify(payload_description),
		})).json();

		console.log('image_json: ', image_json)

		const images: string[] = image_json.data.map((ImageData: ImageData)  => ImageData.url);

		console.log(images)

		setImages(images)
		
		setLoading(false);
		setCanShowImage(true);
	}

  return (
    <>
      <Head>
        <title>Generate name and logo for your idea</title>
        <meta name="description" content="Generate name and logo for your idea" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className="flex justify-center h-screen bg-gray-100">
  			<div className="w-full sm:w-auto px-4 py-20">
					<div className='justify-center max-w-xl'>
						<h1 className="text-3xl font-bold">
							Create the name, logo and tagline for your business idea
						</h1>
						<form
							className="flex flex-col mb-10 mt-6 w-full"
							onSubmit={handleSubmit}
						>
							<label htmlFor="name">Insert the description of your idea, more specific better results</label>
							<div className='w-full'>
								<textarea
									className="border-2 shadow-sm text-gray-700 rounded-sm px-3 py-2 mb-4 w-full"
									name="name"
									id="name"
									onChange={(e) => setProduct(e.target.value)}
								/>
								<button
									className="min-h-[40px] shadow-sm sm:w-[100px] py-2 inline-flex justify-center font-medium items-center px-4 bg-green-600 text-gray-100 rounded-md hover:bg-green-700"
									type="submit"
								>
									{showLoadingState && (
										<svg
											className="animate-spin h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									)}
									{!showLoadingState ? "Generate" : ""}
								</button>
							</div>
						</form>
						{images.length > 0 ? (
							<div className='justify-start'>
								<p className='text-gray-400'>name: <span className="text-black text-sm">{name}</span></p>
								<p className='text-gray-400'>descripcion: <span className="text-black text-sm">{description}</span></p>
							</div>
						) : null }
						<div className="flex flex-col w-full items-center justify-center gap-4">
							{images.length > 0 ? (
								images.map((url, index) => (
									<div key={index} className="w-full sm:w-[400px] h-[400px] rounded-md shadow-md relative">
										<Image
											alt={`Dall-E representation of: ${product}`}
											className={cn(
												"opacity-0 duration-1000 ease-in-out rounded-md shadow-md h-full object-cover",
												{ "opacity-100": canShowImage }
											)}
											src={url}
											fill={true}
											onLoadingComplete={() => {
												setCanShowImage(true);
											}}
										/>
									</div>
								))
							) : null }
						</div>
					</div>
				</div>
      </main>
    </>
  )
}
