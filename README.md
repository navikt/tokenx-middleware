# Token exchange middleware

A simple middleware to perform [token exchange](https://doc.nais.io/security/auth/tokenx/?h=tokenx). 

Usage: 
```
server.use('your-host/path', idportenTokenExchangeMiddleware('target-audience'));
```
`target-audience` identifies the intended audience for the resulting token, i.e. the target app you request a token for. This value shall be the client_id of the target app using the naming scheme `<cluster>:<namespace>:<appname>` e.g. `prod-fss:namespace1:app1`

Currently only supports ID-Porten OBO-tokens without any custom token claims. 
