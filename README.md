# ccs-annotator-client

This repository contains the app for the CCS Annotator client.

Several components are also published as an [NPM module](https://www.npmjs.com/package/ccs-annotator-client). There are used by the CCS_Annotator client for managing and deploying jobs, and the ccsAnnotator R package.

## CCS annotator client App

The App can be used to log in to any CCS annotator backend. Users therefore never really have to install this App themselves.
For now we're hosting it on [Github pages](https://ccs-amsterdam.github.io/ccs-annotator-client).

Install the app, and run locally for development

```bash
git clone https://github.com/ccs-amsterdam/ccs-annotator-client
cd ccs-annotator-client
npm install
npm start
```

# For my other dev peeps

Deploy the app on Github pages:

```bash
npm run deploy
```

## As an NPM module

The NPM module exposes the Annotator component, as well as some other stuff more under the hood (see src/lib/index.js).
This is primarily intended for the CCS Annotator Manager.

To build and publish, increment version and run:

```bash
npm run build_npm
npm publish
```
