import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { appWithTranslation } from 'next-i18next';

function App({ Component, pageProps }: AppProps) {
  return (
		<UserProvider>
			<Component {...pageProps} />
		</UserProvider>)
}

export default appWithTranslation(App);