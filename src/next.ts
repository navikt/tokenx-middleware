import { Logger } from "./logger";
import { tokenExchange } from "./tokenExchange";
import { validateIdportenSubjectToken } from "./idporten";

export async function exchangeIdportenSubjectToken(
  request: Request,
  audience: string,
  logger: Logger = console
): Promise<void> {
  let subjectToken = request.headers.get("authorization")?.split(" ")[1];

  if (!subjectToken) {
    return;
  }

  try {
    await validateIdportenSubjectToken(subjectToken);

    let tokenSet = await tokenExchange(subjectToken, audience);

    if (!tokenSet?.expired() && tokenSet?.access_token) {
      request.headers.set("authorization", `Bearer ${tokenSet.access_token}`);
    }
  } catch (error) {
    // Handle the error appropriately, e.g., log it or return an error response
    logger.error("Error during exchangeIdportenSubjectToken:", error);
  }
}
