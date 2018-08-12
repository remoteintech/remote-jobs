# Static site generator

This folder contains the template files needed to generate the static site for
this repo ( https://remoteintech.company/ ).

The code that parses the site's data from the Markdown files in this repository
is located in `bin/build-site.js` and `lib/index.js`.

On each new change to `master` or to a GitHub pull request, if there are no
data validation errors, the site is built and deployed to Netlify (the domain
mentioned above for the `master` branch, or a temporary subdomain for pull
requests).

The static site uses a layout and CSS copied from
https://blog.remoteintech.company/ which is a site hosted on WordPress.com, and
the site builder code uses
[`swig`](https://github.com/node-swig/swig-templates)
as an HTML templating engine.

To develop against the site locally, you can run this command:

```sh
npm run build && npm run server
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



The 
