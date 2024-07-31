import { Handler } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import httpStatus from "http-status";
import { Environment } from "../../../../bindings";
import * as authValidation from "../../validations/auth.validation";
import * as authService from "../../services/auth.service";
import * as tokenService from "../../services/token.service";
import { User } from "@prisma/client";

export const register: Handler<Environment> = async (c) => {
	const bodyParse = await c.req.json();
	const body = await authValidation.register.parseAsync(bodyParse);
	const user = await authService.register(body);
	const tokens = await tokenService.generateAuthTokens(user as User);
	return c.json({ user, tokens }, httpStatus.CREATED as StatusCode);
};

export const login: Handler<Environment> = async (c) => {
	const bodyParse = await c.req.json();
	const { email, password } = authValidation.login.parse(bodyParse);
	const user = await authService.loginUserWithEmailAndPassword(email, password);
	const tokens = await tokenService.generateAuthTokens(user as User);
	return c.json({ tokens }, httpStatus.OK as StatusCode);
};
