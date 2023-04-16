import addCorsHeader from "../middleware/addCorsHeader.mjs";
import { rootFunction } from "./root.mjs";
import { getAllUsers } from "./users/get-all-users.mjs";
import { putUser } from "./users/put-user.mjs";
import { putListing } from "./listings/put-listing.mjs";
import { getAllListings } from "./listings/get-all-listings.mjs";

export const rootHandler = addCorsHeader(rootFunction);
export const getAllUsersHandler = addCorsHeader(getAllUsers);
export const putUserHandler = addCorsHeader(putUser);
export const putListingHandler = addCorsHeader(putListing);
export const getAllListingsHandler = addCorsHeader(getAllListings);