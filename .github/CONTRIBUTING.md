# Contributing Guidelines

Please send a Pull Request if you have any additions or changes.

Pull Requests will be accepted based on the following:

1. The Pull Request adheres to the repository's [Code of Conduct](https://github.com/remoteintech/remote-jobs/tree/main/.github/CODE_OF_CONDUCT.md).
1. The company works, at least partially, remotely.
1. The company appears in alphabetical order in the list.
1. The company includes a website.
1. The company info includes the regions that are accepted for remote positions (for more details see the instructions in the [example company profile](/company-profiles/example.md#region))
1. The company has a profile page and the company name links to it (see example [here](/company-profiles/example.md))

Thanks for contributing!

# Docker
### For starting the Docker File

```
>remote-jobs $ sudo docker build . -t remote-jobs
>remote-jobs $ sudo docker image ls
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
remote-job   latest    971f9317008d   14 minutes ago   204MB
>remote-jobs $ sudo docker run -p 8080:8080 remote-jobs
> start
> bin/serve-site.js

Parsing content
Requesting URL "https://blog.remoteintech.company/"
Requesting URL "https://s1.wp.com/_static/??-eJyNktFSAyEMRX9IiGvXVh8cvwXYDKYGliHQDn..."
Requesting URL "https://s1.wp.com/_static/??-eJyVUO1qwzAMfKFpImOk7Mfos7iqmjixLWPLlL..."
Requesting URL "https://s2.wp.com/wp-content/mu-plugins/global-print/global-print.c..."
Requesting URL "https://s0.wp.com/wp-content/themes/h4/global.css?m=1420737423h&css..."
Requesting URL "https://s0.wp.com/?custom-css=1&csblog=9eXnX&cscache=6&csrev=6"
Requesting URL "https://s0.wp.com/_static/??-eJx9jNsKwjAMhl/ILky0sAvxWUobZrYegkkpe3..."
Copying favicon files
Generating search index
Writing main page
Writing company pages..........................................................................
Writing custom 404 page

Writing empty robots.txt

Site files are ready in "site/build/"
Starting up http-server, serving /node/site/build

http-server version: 14.0.0

http-server settings: 
CORS: disabled
Cache: 3600 seconds
Connection Timeout: 120 seconds
Directory Listings: visible
AutoIndex: visible
Serve GZIP Files: false
Serve Brotli Files: false
Default File Extension: none

Available on:
  http://127.0.0.1:8080
  http://172.17.0.2:8080
Hit CTRL-C to stop the server

```
