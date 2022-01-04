# ccs-annotator-client

This repository contains the core components for the [CCS Annotator](https://github.com/ccs-amsterdam/CCS_annotator) client.
It is simultaneously the app for the client and an [NPM module](https://www.npmjs.com/package/ccs-annotator-client).

Eventually, the NPM module might be separated an imported here, but for now this makes it easier to debug.

## CCS annotator client App

The App can be used to log in to any CCS annotator backend. Users therefore never really have to install this App themselves.
For now we're hosting it on [Github pages](https://ccs-amsterdam.github.io/ccs-annotator-client/#/).

Install the app, and run locally for development

```bash
git clone https://github.com/ccs-amsterdam/CCS_annotator
cd CCS_annotator
npm install
npm start
```

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
