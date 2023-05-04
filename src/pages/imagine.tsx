import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useState , useRef, useEffect } from "react";
import cn from "classnames";
import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import { Upload as UploadIcon, ChevronLeft, ChevronLeftSquare, ChevronRightSquare, CheckCircle2, XCircle } from "lucide-react";
import { Download as DownloadIcon } from "lucide-react";
import Link from 'next/link';
import { ObjectId } from 'mongodb';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { UserGenModel, Generation, LogoDescription, DesighBrief, webDomain} from '@/models/generation';
import clientPromise from '@/lib/mongodb';
import FeedbackBox from '@/components/FeedbackBox';

const inter = Inter({ subsets: ['latin'] });

interface User {
  name: string;
  email: string;
  // TODO - Add any other properties you need for the user object.
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

		// console.log('pages/imagine#getServerSideProps#userGen: ', userGen);
		// console.log('pages/imagine#getServerSideProps#userGen._id: ', userGen._id);
		
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
	const [description, setDescription] = useState<Partial<LogoDescription | string>>({});
	const [sloganTaglineDomains, setsLoganTaglineDomains] = useState("");
	const [designBrief, setDesignBrief] = useState<DesighBrief | string>("");
	const [generations, setGenerations] = useState<Generation[]>(userGen.generation);
	const [genLen, setGenLen] = useState(userGen.generation.length);
	const [genIndex, setGenIndex] = useState(genLen);
	const [genLenPlus1, setGenLenPlus1] = useState(genLen + 1);
	const [logoDescriptionWhy, setLogoDescriptionWhy] = useState("");

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
	
	const getDesignBrief = async (product: string): Promise<DesighBrief> => {
		const payload: RequestPayload = {
			chain: "design_brief",
			prompt: {
				product: product
			}
		};

		const response = await request("/api/genChat", payload);
		console.log('getDesignBrief#response: ', response.result);

		return response.result;
	};

	
	const getCompanyLogoDescription = async (product: string, design_brief: string): Promise<LogoDescription | string> => {
		const payload: RequestPayload = {
			chain: "logo_description_brief",
			prompt: {
				product,
				design_brief: design_brief
			},
		};
	
		const response = await request("/api/genChat", payload);
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

	const handleCreate =  async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		if (user && user.email !== 'davad701@gmail.com') {
			sendEmail('generateCTA', product);

			alert("We are processing the payments manually for now. We'll send you a email for complete the payment and add credits to your account :)");
			setLoading(false);
			return;
		}

		setGenIndex(genLen);
		
		try {
			let design_briefNLine = await getDesignBrief(product);

			// #.
			if (!design_briefNLine['Web domain']) return;
			let indexDomain = 0;
			let domainAvailable = design_briefNLine['Web domain'][indexDomain].available;
			let getDomains: webDomain[] = design_briefNLine['Web domain'];
			while(!domainAvailable) {
				let response: webDomain[] = (await request("/api/genChat", {
					chain: "get_domain",
					prompt: {
						product: product,
						company_name: design_briefNLine['Company name'],
						domain: design_briefNLine['Web domain'][indexDomain].domain,
					}
				})).result;
				getDomains = getDomains.concat(response);
				console.log('!domainAvailable#getDomains', getDomains);
				domainAvailable = response.some(webDom => webDom.available)
				console.log(domainAvailable)
				indexDomain++;
			}
			design_briefNLine['Web domain'] = getDomains;
			
			setDesignBrief(design_briefNLine);

	
			const logo_description_brief = await getCompanyLogoDescription(product, JSON.stringify(design_briefNLine));
			setDescription(logo_description_brief);

			let promptConcat: string | LogoDescription = "";
	
			const justGetTheLogoDescription = true;
			if (justGetTheLogoDescription) {
				promptConcat = logo_description_brief;
			} else {
				let promptConcat: string = "";
				Object.entries(logo_description_brief).forEach(([key, value]) => {
					console.log('key: ', key)
					if(key !== 'Why') {
						promptConcat += value
					}
				});
			}

			const logo_description_why = (await request("/api/genChat", {
				chain: "logo_description_why",
				prompt: {
					product,
					design_brief: designBrief,
					logo_description_brief: logo_description_brief
				},
			})).result;

			setLogoDescriptionWhy(logo_description_why);

			const image_json = await getImageJson(promptConcat);

			const images: string[] = image_json.map((ImageData: ImageData) => ImageData.url);
			setImages(images);
	
			await saveGeneration(images, design_briefNLine, logo_description_brief, logo_description_why);
	
			setGenerations((prevGenerations) => {
				const newGeneration = {
					createdDate: Date.now(),
					product: product,
					images: images,
					description: logo_description_brief,
					designBrief: design_briefNLine,
					logoDescriptionWhy: logo_description_why
				};
			
				const updatedGenerations = [...prevGenerations, newGeneration];
				setGenLen(updatedGenerations.length);
				setGenLenPlus1(updatedGenerations.length + 1);
			
				return updatedGenerations;
			});
			
			setLoading(false);
			setCanShowImage(true);
		} catch (error) {
			console.log('error: ', error);
			return;
		}
	}

	const saveGeneration = async (images: string[], design_brief: DesighBrief, logo_description_brief: any, logo_description_why: any) => {
		if(!user?.name) return;
		if(!user?.email) return;
		
		const data: UserGenModel = {
			_id: userGen._id,
			name: user.name,
			email: user.email,
			generation: [
				{
					createdDate: Date.now(),
					product: product,
					images: images,
					description: logo_description_brief,
					designBrief: design_brief,
					logoDescriptionWhy: logo_description_why
				}
			]
		}

		const response = await fetch("/api/db/save-generation", {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(data),
		});

		const result = await response.json();
	}

	enum Navigation {
		Previous,
		Next,
	}

	const navigateGenerations = (direction: Navigation) => {
		if (genLen === 0) return;
		
		let newIndex: number;
	
		switch (direction) {
			case Navigation.Previous:
				newIndex = (genIndex - 1 + genLenPlus1) % genLenPlus1;
				break;
			case Navigation.Next:
				newIndex = (genIndex + 1) % genLenPlus1;
				break;
			default:
				newIndex = genLenPlus1;
				break;
		}
	
		setGenIndex(newIndex);
	};

	function isWebDomain(obj: any): obj is webDomain {
    return obj && typeof obj.domain === 'string' && typeof obj.available === 'boolean';
	}

	function displayValue(value: string | boolean | string[] | webDomain[] | undefined): React.ReactNode {
		if (typeof value === 'string') {
			return <>{String(value)}</>;
		} else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
			return <>{value.join(', ')}</>;
		} else if (Array.isArray(value) && value.length > 0 && isWebDomain(value[0])) {
			return displayWebDomains(value as webDomain[]);
		} else {
			return null;
		}
	}

	function displayWebDomains(webDomains: webDomain[]): JSX.Element {
		return (
			<>
				{webDomains.map((webDomain, index) => (
					webDomain ? (<div className='flex flex-row' key={index}>
						<div>{webDomain.domain}</div>
						<div className='ml-1 mt-1.5'>{webDomain.available ? <CheckCircle2 color='green' size={18} strokeWidth={2} /> : <XCircle color='red' size={18} />}</div>
					</div>) : null
				))}
			</>
		);
	}

	useEffect(() => {
    if (genIndex === genLen) {
      setDescription({});
      setDesignBrief('');
      setImages([]);
			return;
    }

    setImages(generations[genIndex].images);
    setDesignBrief(generations[genIndex].designBrief);
    setDescription(generations[genIndex].description);
		setLogoDescriptionWhy(generations[genIndex].logoDescriptionWhy);
		setProduct(generations[genIndex].product);
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
					{user ? (
						<div className=' absolute top-2 right-3'>
							<Link href="/api/auth/logout">
								Logout
							</Link>
						</div>
					) : null}
					<div className='justify-center max-w-xl mb-10'>
						<h1 className="text-3xl font-bold">
							{/* Create the name, logo and slogan for your business idea */}
							Get identity brand assets for your Business.
						</h1>
						<form
							className="flex flex-col mb-10 mt-6 w-full"
							onSubmit={handleCreate}
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
							{/* genLen: {genLen}
							<br/>
							genIndex: {genIndex}
							<br/> */}
							{(genLen > 0 && !showLoadingState) ? (
								<>
									<div className=' flex flex-row justify-between mb-3'>
										<button onClick={() => {navigateGenerations(Navigation.Previous)}}>
											<ChevronLeftSquare />
										</button>
										<button onClick={() => {navigateGenerations(Navigation.Next)}}>
											<ChevronRightSquare />
										</button>
									</div>
								</>
							) : null}
						</div>
						{images.length > 0 ? (
							<div className='justify-start'>
								{/* <p className='text-gray-400'>name: <span className="text-black text-sm">{name}</span></p> */}
								{/* <p className='text-gray-400'><span className="text-black text-sm" dangerouslySetInnerHTML={{__html: sloganTaglineDomains}}/></p> */}
								<p className='text-gray-400'><span className="text-black text-sm"><strong>Product:</strong> {product}</span></p>
								{(typeof designBrief === 'string' && designBrief.length > 0) ? (
									<p className='text-gray-400'><span className="text-black text-sm" dangerouslySetInnerHTML={{__html: designBrief}}/><br/></p>
								) : typeof designBrief === 'object' && designBrief !== null ? (
									<>
										{Object.entries(designBrief).map(([key, value]) => (
												<p key={key}>
														<strong>{key}:</strong> {displayValue(value)}
														<br />
												</p>
										))}
									</>
								): <p>There was an error. Please try again or send a message to feedback.</p>}
								<p className='text-gray-400'><span className="text-black text-sm"><strong>Logo composition:</strong> {logoDescriptionWhy}</span></p><br/>
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
				<FeedbackBox name={user.name} email={user.email}/>
      </main>
    </>
  )
}
