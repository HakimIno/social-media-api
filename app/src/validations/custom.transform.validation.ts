import * as bcrypt from "bcryptjs";

export const hashPassword = async (value: string): Promise<string> => {
	const hashedPassword = await bcrypt.hash(value, 8);
	return hashedPassword;
};

export const isPasswordMatch = async (
	plainPassword: string,
	hashedPassword: string,
): Promise<boolean> => {
	return await bcrypt.compare(plainPassword, hashedPassword);
};
