# AnnoTinder

This repository contains the app for the AnnoTinder client.

Several components are also published as an [NPM module](https://www.npmjs.com/package/annotinder). There are used by the CCS_Annotator client for managing and deploying jobs, and the annotinder R package.

## AnnoTinder client App

The App can be used to log in to any AnnoTinder backend. Users therefore never really have to install this App themselves.
For now we're hosting it on [Github pages](https://ccs-amsterdam.github.io/annotinder).

Install the app, and run locally for development

```bash
git clone https://github.com/ccs-amsterdam/annotinder
cd annotinder
npm install
npm start
```

# For my other dev peeps

Deploy the app on Github pages:

```bash
npm run deploy
```

## As an NPM module

The NPM module doesn't cover the entire client, but exposes some components (see src/lib/index.js).
This is primarily intended for the annotinder-r-client and annotinder-manager (forthcoming).

To build and publish, increment version and run:

```bash
npm run build_npm
npm publish
```
