import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from "react";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

	const [prompt, setPrompt] = useState("");
	const [loading, setLoading] = useState(false);
	const [image, setImage] = useState(null);
	const [canShowImage, setCanShowImage] = useState(false);


	const showLoadingState = loading || (image && !canShowImage);
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
						>
							<label htmlFor="name">Insert the description of your idea, more specific better results</label>
							<div className='w-full'>
								<input
									className="border-2 shadow-sm text-gray-700 rounded-sm px-3 py-2 mb-4 sm:mb-0 sm:min-w-[600px]"
									type="text"
									name="name"
									id="name"
									onChange={(e) => setPrompt(e.target.value)}
								/>
								<button
									className="min-h-[40px] shadow-sm sm:w-[100px] py-2 inline-flex justify-center font-medium items-center px-4 bg-green-600 text-gray-100 sm:ml-2 rounded-md hover:bg-green-700"
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
					</div>
				</div>
      </main>
    </>
  )
}
