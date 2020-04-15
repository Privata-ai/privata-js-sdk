# Blockbird Data NPM Package

This repository is the NPM package to send data accesses from a client's Node application to the Blockbird Data.

For testing, create an `.env` file as follows:

```
dbKey=testing-database-id
DBSECRET=testing-database-secret
APIURL=http://api-url:3000
```

Note: To test locally change the fireabase config in `auth/index.ts`

Then you can run:

```
npm run test
```

## Still to do

- [ ] The requests are not batched. Currently every query that is sent is uploaded individually to the API. On the Java package, we batch the queries to reduce network traffic
- [x] ~~We only get the list of Pii Tables and Columns during initialization. If a user edits a database on the Web App we currently don't recheck. We should check in on the Pii Tables and Columns (perhaps every hour) to get the latest.~~ UPDATE: We do it before every query submission.
- [ ] Update documentation for NPM users
- [ ] Publish package
