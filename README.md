# Privata.ai SDK

A JavaScript SDK to facilitate the interaction with [Privata.ai](https://privata.ai/).

You can find more about this SDK on [our documentation](https://documentation.privata.ai/sdk/js).

## What is Privata.ai?

Privata.ai is a modern User Behavior Analytic (UBA) used to detect insider threats within an application.

Our platform flags sensitive data on different databases and then monitors individual user accesses to that data through the applications. Our SDK is used within your application's code to send information about these accesses to our API so your customers can view and analyze their users behaviour.

## SDK development

### Testing

For testing, create an `.env` file as follows:

```
dbKey=testing-database-id
DBSECRET=testing-database-secret
APIURL=http://api-url:3000
```

Note: To test locally change the Fireabase config in `auth/index.ts`

Then you can run:

```
npm run test
```
