import jwt from "@tsndr/cloudflare-worker-jwt";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";
import { Selectable } from "kysely";
import { Role } from "../config/roles";
import { TokenType, tokenTypes } from "../config/tokens";
import { User } from "@prisma/client";
import { UserWithoutExtras } from "../models/user.model";

export const generateToken = async (
	type: TokenType,
	expires: Dayjs,
	secret: string,
	user: UserWithoutExtras, // Expecting the user without extras
) => {
	const payload = {
		sub: user.id.toString(),
		exp: expires.unix(),
		iat: dayjs().unix(),
		type,
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

	const userData: UserWithoutExtras = {
		id: Number(user.id),
		name: user.name,
		email: user.email,
		is_email_verified: user.is_email_verified,
		role: user.role
	}

	const accessToken = await generateToken(
		tokenTypes.ACCESS,
		accessTokenExpires,
		String(Bun.env.JWT_SECRET),
		userData
	);

	const refreshTokenExpires = dayjs().add(
		Number(Bun.env.JWT_REFRESH_EXPIRATION_DAYS),
		"days",
	);
	const refreshToken = await generateToken(
		tokenTypes.REFRESH,
		refreshTokenExpires,
		String(Bun.env.secret),
		userData
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

	const userData = {
		id: user.id,
		name: user.name,
		email: user.email,
		is_email_verified: user.is_email_verified,
		role: user.role
	} as any

	const verifyEmailToken = await generateToken(
		tokenTypes.VERIFY_EMAIL,
		expires,
		String(Bun.env.JWT_SECRET),
		userData
	);
	return verifyEmailToken;
};

export const generateResetPasswordToken = async (user: Selectable<User>) => {
	const expires = dayjs().add(
		Number(Bun.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES),
		"minutes",
	);
	const userData = {
		id: user.id,
		name: user.name,
		email: user.email,
		is_email_verified: user.is_email_verified,
		role: user.role
	} as any

	const resetPasswordToken = await generateToken(
		tokenTypes.RESET_PASSWORD,
		expires,
		String(Bun.env.JWT_SECRET),
		userData
	);
	return resetPasswordToken;
};
