import jwt from "@tsndr/cloudflare-worker-jwt";
import { MiddlewareHandler } from "hono";
import httpStatus from "http-status";
import { Environment } from "../../../bindings";
import { roleRights, Permission, Role } from "../config/roles";
import { tokenTypes } from "../config/tokens";
import { ApiError } from "../utils/ApiError";

interface Payload {
	type?: string;
	role?: string;
	sub?: string;
	isEmailVerified?: boolean;
}

const authenticate = async (jwtToken: string, secret: string) => {
	let authorized = false;
	let payload: Payload | null = null;
	try {
		const decoded = jwt.decode(jwtToken);
		if (decoded) {
			payload = decoded.payload as { type?: string };
			authorized =
				(await jwt.verify(jwtToken, secret)) &&
				payload?.type === tokenTypes.ACCESS;
		}
	} catch (e) {}
	return { authorized, payload };
};

export const auth =
	(...requiredRights: Permission[]): MiddlewareHandler<Environment> =>
	async (c, next) => {
		const credentials = c.req.header("Authorization");
		if (!credentials) {
			throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
		}
		const parts = credentials.split(/\s+/);
		if (parts.length !== 2) {
			throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
		}
		const jwtToken = parts[1];
		const { authorized, payload } = await authenticate(
			jwtToken,
			String(Bun.env.JWT_SECRET),
		);
		if (!authorized || !payload) {
			throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
		}

		if (requiredRights.length) {
			const userRights = roleRights[payload.role as Role];
			const hasRequiredRights = requiredRights.every((requiredRight) =>
				(userRights as unknown as string[]).includes(requiredRight),
			);
			if (!hasRequiredRights && c.req.param("userId") !== payload.sub) {
				throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
			}
		}
		// if (!payload.isEmailVerified) {
		//   // await getUserById(Number(payload.sub), config['database'])
		//   const user = {}
		//   if (!user) {
		//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
		//   }
		//   const url = new URL(c.req.url)
		//   if (url.pathname !== '/v1/auth/send-verification-email') {
		//     throw new ApiError(httpStatus.FORBIDDEN, 'Please verify your email')
		//   }
		// }
		c.set("payload", payload);
		await next();
	};
