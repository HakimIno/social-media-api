import { getSentry } from "@hono/sentry";
import type { ErrorHandler } from "hono";
import { StatusCode } from "hono/utils/http-status";
import * as httpStatus from "http-status";
import type { Toucan } from "toucan-js";
import { ZodError } from "zod";
import { Environment } from "../../../bindings";
import { ApiError } from "../utils/ApiError";
import { generateZodErrorMessage } from "../utils/zod";

const genericJSONErrMsg = "Unexpected end of JSON input";

enum HttpStatus {
	BAD_REQUEST = "Bad Request",
	INTERNAL_SERVER_ERROR = "Internal Server Error",
}

interface HttpStatusMessages {
	[key: number]: string;
}

const statusCodeToMessage: HttpStatusMessages = {
	400: HttpStatus.BAD_REQUEST,
	500: HttpStatus.INTERNAL_SERVER_ERROR,
};

export const errorConverter = (err: unknown, sentry: Toucan): ApiError => {
	let error = err;
	if (error instanceof ZodError) {
		const errorMessage = generateZodErrorMessage(error);
		error = new ApiError(httpStatus.BAD_REQUEST, errorMessage);
	} else if (
		error instanceof SyntaxError &&
		error.message.includes(genericJSONErrMsg)
	) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON payload");
	} else if (!(error instanceof ApiError)) {
		const castedErr = (typeof error === "object" ? error : {}) as Record<
			string,
			unknown
		>;
		const statusCode: number =
			typeof castedErr.statusCode === "number"
				? castedErr.statusCode
				: httpStatus.INTERNAL_SERVER_ERROR;
		const message = (castedErr.description ||
			castedErr.message ||
			statusCodeToMessage[statusCode]) as string;
		if (statusCode >= 500) {
			sentry.captureException(error);
		}
		error = new ApiError(statusCode, message, false);
	}
	return error as ApiError;
};

export const errorHandler: ErrorHandler<Environment> = async (err, c) => {
	const env = c.env.ENV || "production";
	const sentry = getSentry(c);
	const error = errorConverter(err, sentry);
	if (env === "production" && !error.isOperational) {
		error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		error.message = statusCodeToMessage[httpStatus.INTERNAL_SERVER_ERROR];
	}
	const response = {
		code: error.statusCode,
		message: error.message,
		...(env === "development" && { stack: err.stack }),
	};
	delete c.error;
	return c.json(response, error.statusCode as StatusCode);
};
