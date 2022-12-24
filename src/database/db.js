import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const configDB = {
    connectionString: process.env.DATABASE_URL,
};

if (process.send.MODE === "PROD") {
    configDB.ssl = {
        rejectUnauthorized: false,
    };
}

const connection = new Pool(configDB);

export default connection;
