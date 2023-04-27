import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from "react";
import cn from "classnames";
import Link from 'next/link';
import FeedbackBox from '@/components/FeedbackBox';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import type { GetStaticPropsContext } from 'next';

const inter = Inter({ subsets: ['latin'] })

interface ImageData {
  url: string;
}

type RequestPayload = {
  chain: string;
  prompt: any;
};

export async function getStaticProps(context: GetStaticPropsContext) {
	const locale = context.locale || 'en';
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    }
  };
}

export default function Home() {

	const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>Generate name and logo for your idea</title>
        <meta name="description" content="Generate name and logo for your idea" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className="flex justify-center h-screen bg-gray-100">
				<div className="flex flex-col justify-center max-w-xl px-2 gap-3">
					<h1 className="text-4xl font-bold text-center">{t('title')}</h1>
					<p className="text-center text-xl">{t('tagline')}</p>
					<Link 
						className="shadow-sm py-2 inline-flex justify-center font-medium items-center px-4 bg-green-600
							text-gray-100 rounded-md hover:bg-green-700 mt-2"
						href="/api/auth/login"
					>
						{t('price')}
					</Link>
				</div>
				<FeedbackBox />
      </main>
    </>
  )
}
