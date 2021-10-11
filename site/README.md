# Static site generator

## Overview

This folder contains the template files needed to generate the static site for
this repo ( https://remoteintech.company/ ).

The code that parses the site's data from the Markdown files in this repository
is located in `bin/build-site.js` and `lib/index.js`.

On each new change to `main` or to a GitHub pull request, if there are no
data validation errors, the site is built and deployed to Netlify (the domain
mentioned above for the `main` branch, or a temporary subdomain for pull
requests).

The static site uses a layout and CSS copied from
https://blog.remoteintech.company/ which is a site hosted on WordPress.com, and
the site builder code uses
[`swig`](https://github.com/node-swig/swig-templates)
as an HTML templating engine.

## Development

If you submit any changes as a pull request, GitHub and Netlify will
automatically validate, build, and deploy a preview of the site for you.

For longer-running or more complicated changes, though, it can be useful to run
the site locally.  To make this work, you should be using the version of
Node.js specified in the `.nvmrc` file.  Other versions may work but have not
been tested.

Run `npm install` to install dependencies.

Then run `npm start` to build and serve the site locally.

You can also use `nodemon` to automatically rebuild and reload the site when
you make changes:

```sh
npm install -g nodemon
nodemon bin/serve-site.js
```

If you just want the data structure used to build the site, you can do this:

```js
~/code/remote-jobs $ node
> const { parseFromDirectory } = require( './lib' );
undefined
> const data = parseFromDirectory( '.' );
undefined
> Object.keys( data );
[ 'ok',
  'profileFilenames',
  'profileHeadingCounts',
  'companies',
  'readmeContent' ]
> Object.keys( data.companies[ 0 ] )
[ 'name',
  'isIncomplete',
  'websiteUrl',
  'websiteText',
  'shortRegion',
  'linkedFilename',
  'profileContent' ]
...
```
