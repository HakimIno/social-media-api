import { AuthProviderTable } from "../models/oauth/oauthBase.model";
import { UserTable } from "../models/user.model";

export interface Database {
	user: UserTable;
	authorisations: AuthProviderTable;
}

export const getDBClient = () => {
	return;
};
