import chalk from "chalk";
import dayjs from "dayjs";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
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
        const hashPassword = bcrypt.hashSync(password, 10);

        const insertUser = await connection.query(
            `
        INSERT INTO
            users (name, email, password)
        VALUES ($1, $2, $3)`,
            [name, email, hashPassword]
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

        if (getUser.rowCount === 0) {
            res.send(409);
            return;
        }

        const acceptedPassword = bcrypt.compareSync(
            password,
            getUser.rows[0].password
        );

        if (acceptedPassword) {
            const isLogged = await connection.query(
                `SELECT * FROM sessions WHERE user_id = $1`,
                [getUser.rows[0].id]
            );

            if (isLogged.rowCount > 0) {
                res.status(200).send({ token: isLogged.rows[0].token });
                return;
            }

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
            return;
        }

        res.sendStatus(400);
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
