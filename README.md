# Clickmart API

## How to run

1. Clone this repository
2. Create a `.env` file in the root directory and add the following environment variables:
   ```
   DATABASE_URL=postgres://<username>:<password>@localhost:5432/<database>
   POSTGRES_PASSWORD=<password>
   ```
3. Install the dependencies with `npm install`
4. Setup the database with `npm run setup`
5. Apply the migrations and start the server with `npm start`