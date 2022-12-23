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

async function openShorten(req, res) {
    const { shortUrl } = req.params;

    try {
        const getUrl = await connection.query(
            `SELECT * FROM shortens WHERE short_url = $1`,
            [shortUrl]
        );

        const shortId = getUrl.rows[0].id;

        const getHits = await connection.query(
            `
            SELECT * FROM access WHERE short_id = $1`,
            [shortId]
        );

        if (getHits.rowCount > 0) {
            const incrementAccess = await connection.query(
                `
                UPDATE access
                SET access = access + 1
                WHERE short_id = $1`,
                [shortId]
            );
            res.redirect(getUrl.rows[0].url);
            return;
        }

        const insertAccess = await connection.query(
            `
                INSERT INTO access (short_id, access)
                VALUES ($1, $2)`,
            [shortId, 1]
        );

        res.redirect(getUrl.rows[0].url);
    } catch (error) {
        if (error.constraint === "users_email_key") {
            res.sendStatus(409);
            return;
        }

        chalk.redBright(dayjs().format("YYYY-MM-DD HH:mm:ss"), error.message);
        return res.sendStatus(500);
    }
}

export { insertShorten, openShorten };
