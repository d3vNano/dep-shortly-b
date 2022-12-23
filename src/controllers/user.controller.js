import chalk from "chalk";
import dayjs from "dayjs";
import connection from "../database/db.js";

async function getUser(req, res) {
    const { id } = req.params;
    const { user } = res.locals;

    if (id != user.id) {
        return res.sendStatus(401); // unauthorized
    }

    try {
        const visitResult = await connection.query(
            `SELECT SUM(access.access) FROM access JOIN shortens ON access.short_id = shortens.id WHERE shortens.user_id = $1`,
            [id]
        );
        const [access] = visitResult.rows;

        const urlsResult = await connection.query(
            `SELECT * FROM shortens WHERE shortens.user_id = $1`,
            [id]
        );
        const userUrls = urlsResult.rows;

        res.send({
            id: user.id,
            name: user.name,
            access: access.sum || 0,
            shortenedUrls: userUrls,
        });
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

async function getRanking(req, res) {
    try {
        const buildRanking = await connection.query(``);
        res.send(buildRanking.rows);
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

export { getUser, getRanking };
