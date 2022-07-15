# TOPIC:
```
We'd like to get a feel for how you approach problems, how you think, and how you design your code. Please complete the exercise below and upload your code to a github repo! Thank you and have fun! 
Introduction: You only need to implement one user login REST API. Below are some specific requirements. 
Stories: 
1. A user can login with a username and password 
2. Return success and a JWT token if username and password are correct 
3. Return fail if username and password are not matched 
4. A user has a maximum of 3 attempts within 5 minutes. otherwise. the user will be locked. 
5. Return fail if a user is locked

Requirements: 
1. Use Node.js framework (Nest.js and express.js). typescript is preferred but not required. 
2. Use MongoDB (You can design your own data structure) 
3. Unit testing is required 
4. Integration testing is required 
5. Dockerize your code and your database 6. Upload your project to github and write a proper readme 
```
## Struct Project
```
  ├── ...
  ├── public                          # static asset files 
  ├── src                     
  │   ├── common                      # Base abstract, constant, decorators, util functions
  │   ├── schemas
  │   │   └── user.schema.ts          # Schema file mongodb
  │   └── modules             
  │       ├── auth                  
  │       │   ├── auth.controller.ts  # User controller
  │       │   ├── auth.dto.ts         # Declare dto for user
  │       │   ├── auth.modules.ts     # User module file
  │       │   └── auth.service.ts     # User service handle business logic
  │       └── ...
  ├── services                        # External service like mail service, firebase service
  │   ├── fcm.service.ts              # Fcm service
  │   └──
  └── ...
```
# Prerequisite
- Install package:
```
npm run install
```
- Install Docker on your device.
## What I am done:

Requirements
1. I am using NestJS and TypeScript.
2. Mongoose is best choice for Mongo + Javascript.
3. Unit test: I write Unit test on auth.service.spec.ts
Run command to test:
```
npm run test
```
4. Integration test: I write Integration test on auth.e2e-spect.ts
Run command to test:
```
npm run test:e2e
```
5. Docker contains NestJS project and MongoDb.
Run command for development:
```
docker-compose up dev
```
Run command for production:
```
docker-compose up -d prod
```