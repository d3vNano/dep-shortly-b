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

async function getShorten(req, res) {
    const { id } = req.params;

    const getShorten = await connection.query(
        `
        SELECT * FROM shortens WHERE id = $1`,
        [id]
    );

    delete getShorten.rows[0].user_id;

    res.send(getShorten.rows);
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

async function deleteShorten(req, res) {
    const { id } = req.params;
    const { user } = res.locals;

    console.log(user);

    try {
        const getUrl = await connection.query(
            `SELECT * FROM shortens WHERE id = $1`,
            [id]
        );

        if (getUrl.rowCount === 0) {
            return res.sendStatus(404);
        }

        const [url] = getUrl.rows;
        if (url.user_id !== user.id) {
            return res.sendStatus(401);
        }

        const deleteShorten = await connection.query(
            `DELETE FROM shortens WHERE id=$1`,
            [id]
        );
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500); // server error
    }
}

export { insertShorten, getShorten, openShorten, deleteShorten };
