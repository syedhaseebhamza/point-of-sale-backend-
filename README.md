# Backend

## Project Overview

This project is a backend application built using Node.js and Express. It serves as the server-side component for handling requests, managing data, and facilitating communication between clients and databases.

## Version

- **Current Version**: 1.0.0

## Features

- RESTful API endpoints for various functionalities.
- User authentication and authorization using JSON Web Tokens (JWT).
- File uploads with Multer.


## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB (for database operations)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/syedhaseebhamza/point-of-sale-backend-.git
   cd point-of-sale-backend-


### Install the dependencies:

```sh
npm install
```


### Create a .env file in the root directory and add the necessary environment variables:

PORT=<your_port>
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_REFRESH_SECRET=<your_jwt_refresh_secret>


### To start the application:

```sh
npm run start
```