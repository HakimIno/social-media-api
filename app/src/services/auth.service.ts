import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError";
import * as userService from "./user.service";
import { Register } from "../validations/auth.validation";
import { isPasswordMatch } from "../validations/custom.transform.validation";
import { User } from "@prisma/client";

export const loginUserWithEmailAndPassword = async (
	email: string,
	password: string,
): Promise<User | undefined> => {
	const user = await userService.getUserByEmail(email);
	if (user && !user.password) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			"Please login with your social account",
		);
	}
	if (!user || !(await isPasswordMatch(password, String(user.password)))) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
	}

	return user;
};

export const register = async (body: Register): Promise<User | undefined> => {
	const registerBody = { ...body, is_email_verified: false };
	const newUser = await userService.createUser(registerBody);
	return newUser;
};
