import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState , useRef, useEffect } from "react";
import cn from "classnames";
import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router'
import { Upload as UploadIcon, ChevronLeft, ChevronLeftSquare, ChevronRightSquare } from "lucide-react";
import { Download as DownloadIcon } from "lucide-react";
import Link from 'next/link'
import { ObjectId } from 'mongodb';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { GetServerSidePropsContext } from 'next';
import { UserGenModel, Generation, LogoDescription } from '@/models/generation';
import clientPromise from '@/lib/mongodb';

const inter = Inter({ subsets: ['latin'] })

interface User {
  name: string;
  email: string;
  // Add any other properties you need for the user object.
}

interface ImagineProps {
	userGen: UserGenModel;
  user: User;
}

interface ImageData {
  url: string;
}

type RequestPayload = {
  chain: string;
  prompt: any;
};

export const getServerSideProps = withPageAuthRequired({
	async getServerSideProps(context: GetServerSidePropsContext) {
		const session = await getSession(context.req, context.res);
		const locale = context.locale || 'en';

		if (!session || !session.user) {
			return {
				redirect: {
					destination: '/api/auth/login',
					permanent: false,
				},
			};
		}

		await clientPromise

		const baseUrl = process.env.NODE_ENV === 'production' ? 'https://logo.artmelon.me' : 'http://localhost:3000';
		const res = await fetch(`${baseUrl}/api/db/getUser`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: session.user.email,
					name: session.user.name
				}),
			}
		);
		const userGen = await res.json();

		console.log('pages/imagine#getServerSideProps#userGen: ', userGen);
		console.log('pages/imagine#getServerSideProps#userGen._id: ', userGen._id);
		
		return {
			props: {
				userGen,
				user: session.user,
				...(await serverSideTranslations(locale, ['common'])),
			},
		};
	}
});

export default function Imagine({ userGen, user }: ImagineProps) {
	const router = useRouter();

	const { t } = useTranslation('common');
	
	const [product, setProduct] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [images, setImages] = useState<string[]>([]);
	const [canShowImage, setCanShowImage] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState<Partial<LogoDescription>>({});
	const [sloganTaglineDomains, setsLoganTaglineDomains] = useState("");
	const [designBrief, setDesignBrief] = useState("");
	const [generations, setGenerations] = useState<Generation[]>(userGen.generation);
	const [genLen, setGenLen] = useState(userGen.generation.length);
	const [genIndex, setGenIndex] = useState(genLen);

	// si entra o carga, debe mostrar vacio, y botón de anterior.
	// si le da en anterior, debe mostrar la anterior, (size - 1 - i) y no debe pasar de 0.
	// Cuando se cree una nueva, se debe actualizar el valor de generations, y genLen, y mostrar el último.
	// en teoría sirve ahora como esta, si le da en anterior, entonces muestra generations.
	// podría establecer una flag para saber si ya genero una nueva, si es así muestro generations
	// si es new, mostrar generations, donde la última es la nueva.
	// si no new, mostrar empty, new se carga con atrás

	const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

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
		console.log('getDesignBrief#response: ', response.result);

		return response.result;
	};

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

		return response.result.content;
	};

	
	const getCompanyLogoDescription = async (product: string, design_brief: string): Promise<LogoDescription> => {
		const payload: RequestPayload = {
			chain: "logo_description_brief",
			prompt: {
				product,
				design_brief: design_brief
			},
		};
	
		const response = await request("/api/chat", payload);
		return response.result;
	};
	
	const getImageJson = async (
		logo_description_brief: string | LogoDescription
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

		setDescription({})
		setDesignBrief("")
		setImages([])

		// const company_name = await getCompanyName(product);
		// setName(company_name);

		// const sloganTaglineDomains = await getSloganTaglineDomains(company_name, product);
		// setsLoganTaglineDomains(sloganTaglineDomains)

		// console.log('handleSubmit#product: ', product)
		const design_briefN = await getDesignBrief(product);
		// console.log('handleSubmit#design_brief: ', design_briefN)
		setDesignBrief(design_briefN.replace(/\n/g, '<br/>'));

		// const company_logo_description = await getCompanyLogoDescription(company_name, product);
		const logo_description_brief = await getCompanyLogoDescription(product, design_briefN.replace(/\n/g, " "));
		setDescription(logo_description_brief);

		console.log('handleSubmit#logo_description_brief: ', logo_description_brief, logo_description_brief['Prompt'])

		let promptConcat: string = "";
		Object.entries(logo_description_brief).forEach(([key, value]) => {
			console.log('key: ', key)
			if(key !== 'Why') {
				promptConcat += value
			}
		});

		const image_json = await getImageJson(promptConcat);
		console.log('image_json', image_json);
		const images: string[] = image_json.map((ImageData: ImageData) => ImageData.url);
		setImages(images);

		await saveGeneration(images, design_briefN.replace(/\n/g, '<br/>'), logo_description_brief);
		
		setLoading(false);
		setCanShowImage(true);
	}

	const saveGeneration = async (images: any, design_brief: any, logo_description_brief: any) => {
		console.log('saveGeneration#product: ', product);

		if(!user?.name) return;
		if(!user?.email) return;
		
		const data: UserGenModel = {
			id: userGen.id,
			name: user.name,
			email: user.email,
			generation: [
				{
					createdDate: Date.now(),
					product: product,
					images: images,
					description: logo_description_brief,
					designBrief: design_brief
				}
			]
		}

		console.log('saveGeneration#data ', data);

		const response = await fetch("/api/db/save-generation", {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(data),
		});

		const result = await response.json();
		console.log('saveGeneration#result: ', result);
	}

	const posisionateGen = (at: string) => {
		console.log('at: ', at);
    if (genLen === 0) return;
    if (at === 'last') {
      setGenIndex((genIndex - 1 + genLen) % genLen);
			// setGenIndex((genIndex - 1) % genLen);
    } else if (at === 'next') {
      setGenIndex((genIndex + 1) % genLen);
    }
  };

	useEffect(() => {
		console.log('genIndex: ', genIndex);
		// console.log('genIndex', genIndex);
    if (genIndex === genLen) {
      setDescription({});
      setDesignBrief('');
      setImages([]);
			return;
    }

    setImages(generations[genIndex].images);
    setDesignBrief(generations[genIndex].designBrief);
    setDescription(generations[genIndex].description);
  }, [genIndex]);

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
									ref={textareaRef}
									className="resize-none overflow-hidden border-2 shadow-sm text-gray-700 rounded-sm px-3 py-2 mb-4 w-full"
									onInput={handleInput}
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
									{!showLoadingState ? "Create" : ""}
								</button>
							</div>
						</form>
						<div>
							genLen: {genLen}
							<br/>
							genIndex: {genIndex}
							<br/>
							{genLen > 0 ? (
								<>
									{genIndex > -1 ? (
										<button onClick={() => {posisionateGen('last')}}>
											<ChevronLeftSquare />
										</button>
									) : null}
									{genIndex < genLen - 1 ? (
										<button onClick={() => {posisionateGen('next')}}>
											<ChevronRightSquare />
										</button>
									) : null}
								</>
							) : null}
						</div>
						{images.length > 0 ? (
							<div className='justify-start'>
								{/* <p className='text-gray-400'>name: <span className="text-black text-sm">{name}</span></p> */}
								{/* <p className='text-gray-400'><span className="text-black text-sm" dangerouslySetInnerHTML={{__html: sloganTaglineDomains}}/></p> */}
								<p className='text-gray-400'><span className="text-black text-sm" dangerouslySetInnerHTML={{__html: designBrief}}/></p>
								<p className='text-gray-400'><span className="text-black text-sm">Why the logo: {description?.Why}</span></p>
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
				{user ? (
					<Link href="/api/auth/logout">
						Logout
					</Link>
				) : null}
      </main>
    </>
  )
}
