// import { Redis } from '@upstash/redis/cloudflare'
import { Redis } from "ioredis";

export const redisCongig = () => {
	// const redis = new Redis({
	//     token: Bun.env.UPSTASH_REDIS_REST_TOKEN,
	//     url: Bun.env.UPSTASH_REDIS_REST_URL,
	// })

	const redis = new Redis({
		host: Bun.env.REDIS_HOST || "localhost",
		port: Number(Bun.env.REDIS_PORT) || 6379,
		password: Bun.env.REDIS_PASSWORD || undefined,
	});

	return redis;
};
