import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

if(process.env.NODE_ENV === "development") {
	process.env.AUTH0_BASE_URL = 'http://localhost:3000'
} else {
	process.env.AUTH0_BASE_URL = process.env.AUTH0_BASE_URL || process.env.VERCEL_URL;
}

export default handleAuth({
  async login(req, res) {
    await handleLogin(req, res, {
      returnTo: "/imagine",
    });
  },
});
