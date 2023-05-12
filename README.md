# Token exchange middleware

A simple middleware to perform [token exchange](https://doc.nais.io/security/auth/tokenx/?h=tokenx). 

Looks for a valid ID-porten subject token in the autorization header, then exchanges it for an access token which is valid for a given audience (target app) only. 

## Usage: 
```
import { idportenTokenExchangeMiddleware } from "@navikt/tokenx-middleware";

server.use('url-to-another-nais-app', idportenTokenExchangeMiddleware('target-audience'));
```
`target-audience` identifies the intended audience for the resulting token, i.e. the target app you request a token for. This value shall be the `client_id` of the target app using the naming scheme `<cluster>:<namespace>:<appname>` e.g. `prod-gcp:namespace1:app1`.

## Prerequisites
- You have a ID-Porten subject token in the `authorization` header of the request. You can use [Wonderwall](https://doc.nais.io/appendix/wonderwall/?h=wonderwall) to achieve this. 
- The environment variables `IDPORTEN_WELL_KNOWN_URL` and `IDPORTEN_CLIENT_ID` are avaliable at runtime. This happens automatically if you [enable idporten](https://doc.nais.io/security/auth/idporten/?h=idporten#runtime-variables-credentials) in your NAIS app.
- The envirinment variables `TOKEN_X_CLIENT_ID`, `TOKEN_X_PRIVATE_JWK` and `TOKEN_X_WELL_KNOWN_URL` are avaliable at runtime. [Enable TokenX](https://doc.nais.io/security/auth/tokenx/?h=tokenx) for these to be set automatically. 

In short, you need the following spec in your NAIS manifest: 
```
spec:
  tokenx:
    enabled: true
  idporten:
    enabled: true
    sidecar:
      enabled: true
```
