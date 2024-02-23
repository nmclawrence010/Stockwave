import { useUser } from "@auth0/nextjs-auth0/client"; //To get usernames and such from auth0

//Function that returns the user ID of the currently logged in user
export function getCurrentUser() {
  const { user } = useUser(); //Auth0 user
  var stockwaveUser = String(user?.sub);
  return stockwaveUser;
}
