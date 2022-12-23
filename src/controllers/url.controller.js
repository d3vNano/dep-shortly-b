import chalk from "chalk";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import connection from "../database/db.js";

async function insertShorten(req, res) {
    const { url } = req.body;
    const { user_id } = res.locals.user;

    if (!url) {
        res.sendStatus(422);
        return;
    }

    try {
        const shortUrl = nanoid(10);

        const insertShorten = await connection.query(
            `
            INSERT INTO
                shortens (url, short_url, user_id)
            VALUES
                ($1, $2, $3)`,
            [url, shortUrl, user_id]
        );

        res.status(201).send({ shortUrl });
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

export { insertShorten };
