import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia()
	.use(staticPlugin({ prefix: "/" }))
	.post("/turn-credentials", () => ({
		// This is a temporary solution for testing purposes
		urls: process.env.TURN_SERVER_URLS,
		username: process.env.TURN_USERNAME,
		credential: process.env.TURN_CREDENTIAL,
	}))
	.listen(8888);

console.log(
	`🐲: Server is running at ${app.server?.hostname}:${app.server?.port}`,
);
