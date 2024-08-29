# Northcoders News API

The completed project is currently hosted [here](https://nc-project-pmrs.onrender.com).

The aim of the is to build an API for the purpose of accessing application data programmatically. 
The intention here is to mimic the building of a real world backend service (such as Reddit) which should provide this information to the front end architecture.

There are two databases in this project: one for real-looking dev data, and another for simpler test data.You will need to create two .env files for your project: .env.test and .env.development. Into each, add PGDATABASE=, with the correct database name for that environment (see /db/setup.sql for the database names).
To complete the setup of the project run the following commands:
```
npm install
npm run setup-dbs // to create the dbs
npm run seed // to seed the databases
```
To run tests you can `install jest` in addition to `supertest` for *integration testing*. The following commands will help setup testing, if you are using `jest` or `supertest`.
```
npm install jest
npm install supertest --save-dev
```
Other packages you might need to help with formatting queries to the database are [node-pg-format](https://www.npmjs.com/package/pg-format#node-pg-format) and [node-postgres](https://www.npmjs.com/package/pg).

When deploying to hosting service or cloud environment, you need to create a .env file named `.env.production` this will contain the connection string for the `DATABASE_URL=` environment variable. To seed the database add the following `"seed-prod": "NODE_ENV=production npm run seed"` to the `package.json` file before entering the command `npm run seed-prod` into the terminal.

The minimum versions of *Node.js* and *Postgres* needed to run the project are `Node.js v18.20.4` and `PostgreSQL 13.16`


--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
