import jwt from "@tsndr/cloudflare-worker-jwt";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";
import { Selectable } from "kysely";
import { Role } from "../config/roles";
import { TokenType, tokenTypes } from "../config/tokens";
import { User } from "@prisma/client";

export const generateToken = async (
	userId: number,
	type: TokenType,
	role: Role,
	expires: Dayjs,
	secret: string,
	isEmailVerified: boolean,
) => {
	const payload = {
		sub: userId.toString(),
		exp: expires.unix(),
		iat: dayjs().unix(),
		type,
		role,
		isEmailVerified,
	};
	return await jwt.sign(payload, String(secret));
};

export const generateAuthTokens = async (user: Selectable<User>) => {
	if (!user.id) {
		throw new Error("User ID is missing or invalid");
	}

	const accessTokenExpires = dayjs().add(
		Number(Bun.env.JWT_ACCESS_EXPIRATION_MINUTES),
		"minutes",
	);
	const accessToken = await generateToken(
		Number(user.id),
		tokenTypes.ACCESS,
		user.role,
		accessTokenExpires,
		String(Bun.env.JWT_SECRET),
		user.is_email_verified,
	);

	const refreshTokenExpires = dayjs().add(
		Number(Bun.env.JWT_REFRESH_EXPIRATION_DAYS),
		"days",
	);
	const refreshToken = await generateToken(
		Number(user.id),
		tokenTypes.REFRESH,
		user.role,
		refreshTokenExpires,
		String(Bun.env.secret),
		user.is_email_verified,
	);

	return {
		access: {
			token: accessToken,
			expires: accessTokenExpires.toDate(),
		},
		refresh: {
			token: refreshToken,
			expires: refreshTokenExpires.toDate(),
		},
	};
};

export const verifyToken = async (
	token: string,
	type: TokenType,
	secret: string,
) => {
	const isValid = await jwt.verify(token, secret);
	if (!isValid) {
		throw new Error("Token not valid");
	}
	const decoded = jwt.decode(token);
	const payload = decoded.payload;
	//@ts-ignore
	if (type !== payload?.type) {
		throw new Error("Token not valid");
	}
	return payload;
};

export const generateVerifyEmailToken = async (user: Selectable<User>) => {
	const expires = dayjs().add(
		Number(Bun.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES),
		"minutes",
	);
	const verifyEmailToken = await generateToken(
		user.id,
		tokenTypes.VERIFY_EMAIL,
		user.role,
		expires,
		String(Bun.env.JWT_SECRET),
		user.is_email_verified,
	);
	return verifyEmailToken;
};

export const generateResetPasswordToken = async (user: Selectable<User>) => {
	const expires = dayjs().add(
		Number(Bun.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES),
		"minutes",
	);
	const resetPasswordToken = await generateToken(
		user.id,
		tokenTypes.RESET_PASSWORD,
		user.role,
		expires,
		String(Bun.env.JWT_SECRET),
		user.is_email_verified,
	);
	return resetPasswordToken;
};
