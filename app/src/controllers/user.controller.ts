import { Handler } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import httpStatus from "http-status";
import { Environment } from "../../../bindings";
import * as userService from "../services/user.service";
import { ApiError } from "../utils/ApiError";
import * as userValidation from "../validations/user.validation";

export const createUser: Handler<Environment> = async (c) => {
	const bodyParse = await c.req.json();
	const body = await userValidation.createUser.parseAsync(bodyParse);
	const user = await userService.createUser(body);
	return c.json(user, httpStatus.CREATED as StatusCode);
};

export const getUsers: Handler<Environment> = async (c) => {
	const queryParse = c.req.query();
	const query = userValidation.getUsers.parse(queryParse);
	const options = {
		sortBy: query.sort_by,
		limit: query.limit,
		page: query.page,
	};
	const result = await userService.queryUsers(options);
	return c.json(result, httpStatus.OK as StatusCode);
};

export const getUser: Handler<Environment> = async (c) => {
	const paramsParse = c.req.param();
	const params = userValidation.getUser.parse(paramsParse);
	const user = await userService.getUserById(params.userId);
	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, "User not found");
	}
	return c.json(user, httpStatus.OK as StatusCode);
};

export const updateUser: Handler<Environment> = async (c) => {
	const paramsParse = c.req.param();
	const bodyParse = await c.req.json();
	const { params, body } = userValidation.updateUser.parse({
		params: paramsParse,
		body: bodyParse,
	});
	// userService.updateUserById(params.userId, body, config.database)
	const user = {};
	return c.json(user, httpStatus.OK as StatusCode);
};

export const deleteUser: Handler<Environment> = async (c) => {
	const paramsParse = c.req.param();
	const params = userValidation.deleteUser.parse(paramsParse);
	// await userService.deleteUserById(params.userId, config.database)
	c.status(httpStatus.NO_CONTENT as StatusCode);
	return c.body(null);
};
