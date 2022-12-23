import chalk from "chalk";
import dayjs from "dayjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import connection from "../database/db.js";

dotenv.config();

async function signUp(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword ||
        password !== confirmPassword
    ) {
        res.sendStatus(422);
        return;
    }

    try {
        const insertUser = await connection.query(
            `
        INSERT INTO
            users (name, email, password)
        VALUES ($1, $2, $3)`,
            [name, email, password]
        );

        return res.sendStatus(201);
    } catch (error) {
        if (error.constraint === "users_email_key") {
            res.sendStatus(409);
            return;
        }

        chalk.redBright(dayjs().format("YYYY-MM-DD HH:mm:ss"), error.message);
        return res.sendStatus(500);
    }
}

async function signIn(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        res.sendStatus(422);
        return;
    }

    try {
        const getUser = await connection.query(
            `SELECT * FROM users WHERE email=$1`,
            [email]
        );
        const token = jwt.sign(
            { user: getUser.rows[0].id },
            process.env.SECRET_JWT
        );

        const insertSession = await connection.query(
            `
            INSERT INTO
                sessions (token, user_id)
                VALUES ($1, $2)`,
            [token, getUser.rows[0].id]
        );

        res.status(200).send({ token });
    } catch (error) {
        console.log(
            chalk.redBright(
                dayjs().format("YYYY-MM-DD HH:mm:ss"),
                error.message
            )
        );
        res.sendStatus(500);
    }
}

export { signUp, signIn };
