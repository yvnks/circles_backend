# devcamper-api
> backend api for devcamper application. built with MongoDB, Express.js, React, & Node.js

Features the following:
* advanced searching
* pagination
* RESTful architecture

## Install dependencies
```bash
npm install
```

## Start application
```bash
# run in development mode
yarn dev

# run in production mode
yarn start
```

## Environment Variables
You will need to create a `.env` file in the root of the project and add the following environment variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongo_uri

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```
