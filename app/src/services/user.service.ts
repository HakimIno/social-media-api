import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError";
import { CreateUser } from "../validations/user.validation";
import prisma from "../lib/prisma";
import { User } from "@prisma/client";
import { redisCongig } from "../lib/redis";
// const redisClient = redisCongig();

export const createUser = async (
	userBody: CreateUser,
): Promise<User | undefined> => {
	try {
		const user = await prisma.user.create({
			data: userBody,
		});
		return user ?? undefined;
	} catch (error) {
		throw new ApiError(httpStatus.BAD_REQUEST, "User already exists");
	}
};

export const getUserByEmail = async (
	email: string,
): Promise<User | undefined> => {
	const user = await prisma.user.findUnique({ where: { email } });
	return user ?? undefined;
};

export const queryUsers = async (options: {
	sortBy: string;
	limit: number;
	page: number;
}): Promise<User[]> => {
	// const redisUsers = await redisClient.get("users");
	// if (redisUsers) return JSON.parse(redisUsers);

	const { sortBy, limit, page } = options;
	const skip = limit * (page - 1);
	const orderBy = {
		[sortBy.split(":")[0]]: sortBy.split(":")[1] === "asc" ? "asc" : "desc",
	};
	const users = await prisma.user.findMany({
		orderBy,
		take: limit,
		skip,
	});
	// await redisClient.set("users", JSON.stringify(users), "EX", 10);
	return users;
};

export const getUserById = async (id: number): Promise<User | undefined> => {
	const user = await prisma.user.findFirst({ where: { id } });
	return user ? user : undefined;
};
