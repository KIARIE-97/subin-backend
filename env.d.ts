declare global {
  namespace NodeJS {
    interface ProcessEnv {
			GEMINI_API_KEY: string ;
			NODE_ENV: "development" | "production";
		}
  }
}
export {};