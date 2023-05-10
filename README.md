# Token exchange middleware

A middleware that can be used whenever you need to add token exchange to a route.

A very simple middleware to perform [token exchange](https://doc.nais.io/security/auth/tokenx/?h=tokenx). 
Usage: 
```
server.use('your-host/path', idportenTokenExchangeMiddleware('some-audience'));
```

Currently does not support subject tokens from Azure, or adding custom token claims. 