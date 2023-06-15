# Token exchange middleware

A simple middleware to perform [token exchange](https://doc.nais.io/security/auth/tokenx/?h=tokenx). 

Looks for a valid ID-porten subject token in the autorization header, then exchanges it for an access token valid only for a given audience. 

## Usage

In all cases `'<target-audience>'` identifies the intended audience for the resulting token, i.e. the target app you request a token for. This value must be the `client_id` of the target app using the naming scheme `<cluster>:<namespace>:<appname>` e.g. `prod-gcp:namespace1:app1`.

### With Requests from the Fetch API (i.e. when using Next.js)
```
import { exchangeIdportenSubjectToken } from "@navikt/tokenx-middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function middleware(request: NextRequest) {
  exchangeIdportenSubjectToken(request, '<target-audience>')
  return NextResponse.redirect(new URL('/home', request.url));
}

exchangeIdportenSubjectToken()
```

### With Express:
```
import { idportenTokenExchangeMiddleware } from "@navikt/tokenx-middleware";

server.use('url-to-another-nais-app', idportenTokenExchangeMiddleware('<target-audience>'));
```

## Prerequisites
*TLDR*; you need the following spec in your NAIS manifest: 
```
spec:
  tokenx:
    enabled: true
  idporten:
    enabled: true
    sidecar:
      enabled: true
```

*Long version*:  
- You have an ID-Porten subject token in the `authorization` header of the request. You can use [Wonderwall](https://doc.nais.io/appendix/wonderwall/?h=wonderwall) to achieve this. 
- The environment variables `IDPORTEN_WELL_KNOWN_URL` and `IDPORTEN_CLIENT_ID` are avaliable at runtime. This happens automatically if you [enable idporten](https://doc.nais.io/security/auth/idporten/?h=idporten#runtime-variables-credentials) in your NAIS app.
- The environment variables `TOKEN_X_CLIENT_ID`, `TOKEN_X_PRIVATE_JWK` and `TOKEN_X_WELL_KNOWN_URL` are avaliable at runtime. [Enable TokenX](https://doc.nais.io/security/auth/tokenx/?h=tokenx) for these to be set automatically. 

## Releasing new versions
1. Commit all your changes to `main`
2. Run `yarn version --<patch|minor|major>` (following semantic versioning) to create a versioning commit.
3. Push the versioning commit to `main`.  Take note of the version number `<x.y.z>`
3. Go to Github -> Releases -> Draft new release
4. Enter `v<x.y.z>` as the tag, give the release a name and description, and click release.
