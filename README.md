Green Txt Tales
===============

4Chan Green Text Stories

APIDocs
--------

http://brutalhonesty.github.io/greentxttales/

TODO
----
[Here](/grunt-TODO.md)

Demo
----

http://www.greentxttales.com

Installation
------------

```bash
git clone <repo url>
cd /path/to/repo
# Install dependencies and database structure
npm install
bower install

# Development
grunt serve

# Edit settings and configs (depending on your environment)
vim lib/controllers/settings.js
vim lib/config/env/development.js
# or
vim lib/config/env/production.js

# Production
grunt
mv ./dist /path/to/production/location && cd /path/to/production/location
# Use Node to run
PORT=9000 node server.js
# Or use forever
PORT=9000 forever start server.js
```