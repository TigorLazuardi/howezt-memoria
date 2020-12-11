require("dotenv").config();

import app from "./app";

const token = process.env.BOT_TOKEN || "";

app(token);

export default {};
