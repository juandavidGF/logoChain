import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from "react";
import cn from "classnames";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })


export default function Checkout() {

	const handleSuscription = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

	}

	return (
    <>
      <Head>
				<title>Checkout</title>
				<meta name="description" content="Checkout" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{/* <link rel="icon" href="/favicon.ico" /> */}
			</Head>
			<main className="flex justify-center h-screen bg-gray-100">
			<div className="flex justify-center items-center max-w-md">
				<form className="flex flex-col p-8 rounded-lg bg-gray-200 gap-2" onSubmit={handleSuscription}>
					<input
						type="text"
						name="name"
						placeholder="name"
						className="border-1 border-black rounded-full p-2 focus:outline-none"
					/>
					<input
						type="email"
						name="email"
						placeholder="email"
						pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
						className="border-1 border-yellow-300 rounded-full px-3 py-2 focus:outline-none"
					/>
					<button
						type="submit"
						className="border-1 border-yellow-300 bg-yellow-300 text-white rounded-full py-3 px-6 focus:outline-none hover:bg-white hover:text-yellow-300 transition-colors duration-200 ease-in"
					>
						Continuar
					</button>
				</form>
			</div>

			</main>
		</>
	)
}
