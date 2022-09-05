/**
 * Design for authentication
 *
 * First, get rid of passwords. We don't want the responsibility. Instead, let users authenticate
 * via one-time login or oauth2, with the following system:
 * - Users will first have to create a JWT that authenticates them. They can either login one-time,
 *   in which case a random id will be used, or they can login via Oauth2 (Github, maybe more).
 *   The JWT will contain: host, mode (random or github), user_id (email or random_id) and date (for expiring tokens).
 * - Whenever logging in, if mode is github and date more than two hours ago, first verify if token still active
 *
 * PROBLEM:
 * signing the token requires the github client secret,
 * so this would all still require every server to set up a oauth2 app.
 * That seems impossible to prevent (naturally, the server needs to talk to github).
 * So this creates some extra instructions...
 */

import { Button } from "semantic-ui-react";

const Authentication = () => {
  return <Button></Button>;
};
