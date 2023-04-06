import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from "react";
import cn from "classnames";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router'
import { Upload as UploadIcon } from "lucide-react";
import { Download as DownloadIcon } from "lucide-react";

const inter = Inter({ subsets: ['latin'] })

interface ImageData {
  url: string;
}

type RequestPayload = {
  chain: string;
  prompt: any;
};

export default function Imagine() {
	const { user, error, isLoading } = useUser();
	const router = useRouter();

	const [product, setProduct] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [images, setImages] = useState<string[]>([]);
	const [canShowImage, setCanShowImage] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [sloganTaglineDomains, setsLoganTaglineDomains] = useState("");
	const [designBrief, setDesignBrief] = useState("");

	if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

	if(!user) router.push('/');

	const showLoadingState = loading || (images.length > 0 && !canShowImage);

	const request = async (endpoint: string, payload: RequestPayload): Promise<any> => {
		return await (
			await fetch(endpoint, {
				method: "POST",
				body: JSON.stringify(payload),
			})
		).json();
	};
	
	const getCompanyName = async (product: string): Promise<string> => {
		const payload: RequestPayload = {
			chain: "company_name",
			prompt: {
				product: product
			},
		};
	
		const response = await request("/api/chat", payload);
		return response.result.content;
	};
	
	const getDesignBrief = async (product: string): Promise<string> => {
		const payload: RequestPayload = {
			chain: "design_brief",
			prompt: {
				product: product
			}
		};

		const response = await request("/api/chat", payload);
		// console.log('getDesignBrief#response: ', response);
		const contentWithLineBreaks = response.result.content.replace(/\n/g, '<br/>');

		return contentWithLineBreaks;
	};

	function parseBrandInfo(str: string): { slogan: string, tagline: string, webDomains: string[] } | null {
		const regex = /Slogan:\s(.+)\nTagline:\s(.+)\n\nWeb Domains:\n((?:\d\.\s\S+\n)+\d\.\s\S+)/g;
		const match = regex.exec(str);
	
		if (!match) {
			return null;
		}
	
		const slogan = match[1];
		const tagline = match[2];
		const webDomains = match[3].match(/\d\.\s(\S+)/g)?.map((match) => match.replace(/^\d\.\s/, '')) || [];

		const brandInfo = { slogan, tagline, webDomains };
	
		return brandInfo;
	}

	const getSloganTaglineDomains = async (company_name: string, product: string): Promise<any> => {
		const payload: RequestPayload = {
			chain: "company_slogan_tagline_domains",
			prompt: {
				company_name: company_name,
				product: product,
			},
		};

		const response = await request("/api/chat", payload);

		// const brandInfo = parseBrandInfo(response.result['content']);
		// console.log('getSologanTaglineDomains#bandInfo: ', brandInfo);

		const contentWithLineBreaks = response.result.content.replace(/\n/g, '<br/>');

		return contentWithLineBreaks;
	};

	
	const getCompanyLogoDescription = async (product: string, design_brief: string): Promise<string> => {
		const payload: RequestPayload = {
			chain: "logo_description_brief",
			prompt: {
				product,
				design_brief: design_brief
			},
		};
	
		const response = await request("/api/chat", payload);
		return response.result.content;
	};
	
	const getImageJson = async (
		logo_description_brief: string
	): Promise<any> => {
		const payload: RequestPayload = {
			chain: "company_logo_prompt",
			prompt: {
				logo_description_brief: logo_description_brief
			},
		};

		const response = await request("/api/imagine", payload);
	
		return response;
	};	

	const sendEmail = async (key = 'default', product = 'default') => {
		const data = {
			key: key,
			product: product,
			name: user?.name,
			email: user?.email
		}

		await fetch("/api/send-email", {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(data),
		});
	}
	

	const handleSubmit =  async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		if (user && user.email !== 'davad701@gmail.com') {

			sendEmail('generateCTA', product);

			alert("We are processing the payments manually for now. We'll send you a email for complete the payment and add credits to your account :)");
			setLoading(false);
			return;
		}

		// const company_name = await getCompanyName(product);
		// setName(company_name);

		// const sloganTaglineDomains = await getSloganTaglineDomains(company_name, product);
		// setsLoganTaglineDomains(sloganTaglineDomains)

		// console.log('handleSubmit#product: ', product)
		const design_brief = await getDesignBrief(product);
		// console.log('handleSubmit#design_brief: ', design_brief)
		setDesignBrief(design_brief);

		// const company_logo_description = await getCompanyLogoDescription(company_name, product);
		const logo_description_brief = await getCompanyLogoDescription(product, design_brief);
		setDescription(logo_description_brief);


		// console.log('handleSubmit#logo_description_brief: ', logo_description_brief)

		const image_json = await getImageJson(logo_description_brief);
		const images: string[] = image_json.map((ImageData: ImageData) => ImageData.url);
		setImages(images);
		
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
					<div className='justify-center max-w-xl mb-10'>
						<h1 className="text-3xl font-bold">
							{/* Create the name, logo and slogan for your business idea */}
							Get identity brand assets for your Business.
						</h1>
						<form
							className="flex flex-col mb-10 mt-6 w-full"
							onSubmit={handleSubmit}
						>
							<label className='mb-2' htmlFor="name">Describe your product, company, brand ... </label>
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
								{/* <p className='text-gray-400'>name: <span className="text-black text-sm">{name}</span></p> */}
								{/* <p className='text-gray-400'>descripcion: <span className="text-black text-sm">{description}</span></p> */}
								{/* <p className='text-gray-400'><span className="text-black text-sm" dangerouslySetInnerHTML={{__html: sloganTaglineDomains}}/></p> */}
								<p className='text-gray-400'><span className="text-black text-sm" dangerouslySetInnerHTML={{__html: designBrief}}/></p>
							</div>
						) : null }
						<div className="grid grid-cols-2 gap-1 mt-2 mb-10">
							{images.length > 0 ? (
								images.map((url, index) => (
									<div key={index} className="w-full aspect-square shadow-md relative">
										<Image
											alt={`Dall-E representation of: ${product}`}
											className={cn(
												"opacity-0 duration-1000 ease-in-out shadow-md h-full object-cover",
												{ "opacity-100": canShowImage }
											)}
											sizes="(max-width: 640px) 100vw, 640px"
											src={url}
											fill={true}
											onLoadingComplete={() => {
												setCanShowImage(true);
											}}
										/>
										<div className="relative">
											<a
												href={`/api/download-image?url=${encodeURIComponent(url)}`}
												download={`image_${index + 1}.jpg`}
												className="inline-flex justify-center w-sm items-center px-4 py-2 bg-black opacity-25 hover:bg-green-700 text-white rounded-md"
											>
												<DownloadIcon className="icon text-white" />
											</a>
										</div>
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
