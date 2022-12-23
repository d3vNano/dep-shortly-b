import chalk from "chalk";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import connection from "../database/db.js";

async function authMiddleware(req, res, next) {
    const token = req.headers?.authorization.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(token, process.env.SECRET_JWT);
        const getUser = await connection.query(
            `
            SELECT * FROM sessions WHERE user_id = $1 AND active = TRUE`,
            [decoded.user]
        );

        if (getUser.rowCount > 0) {
            res.locals.user = getUser.rows[0];
            next();
        }
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

export { authMiddleware };
