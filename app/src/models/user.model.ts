import * as bcrypt from "bcryptjs";
import { Generated, Selectable } from "kysely";
import { Role } from "../config/roles";
import { BaseModel } from "./base.model";

export interface UserTable {
	id: Generated<number>;
	name: string | null;
	email: string;
	password: string | null;
	is_email_verified: boolean;
	role: Role;
}
export interface UserData {
	id: number;
	name: string | null;
	email: string;
	password: string | null;
	is_email_verified: boolean;
	role: Role;
}

export type UserWithoutExtras = Omit<UserData, 'password'>;

export class User extends BaseModel implements Selectable<UserTable> {
	id: number;
	name: string | null;
	email: string;
	is_email_verified: boolean;
	role: Role;
	password: string | null;
	private_fields = ["password"];

	constructor(user: Selectable<UserTable>) {
		super();
		this.role = user.role ?? "user";
		this.id = user.id ?? 0;
		this.name = user.name || null;
		this.email = user.email;
		this.is_email_verified = user.is_email_verified;
		this.role = user.role;
		this.password = user.password || null;
	}

	isPasswordMatch = async (userPassword: string): Promise<boolean> => {
		if (!this.password) throw "No password connected to user";
		return await bcrypt.compare(userPassword, this.password);
	};

	canAccessPrivateFields(): boolean {
		return this.role === "admin";
	}
}
