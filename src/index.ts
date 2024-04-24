import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia().use(staticPlugin({ prefix: '/' })).listen(3000);

console.log(
	`🐲: Server is running at ${app.server?.hostname}:${app.server?.port}`,
);
