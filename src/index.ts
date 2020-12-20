if (process.env.NODE_ENV?.trim() === "development") require("dotenv").config()

import "module-alias/register"
import "./app"

export default {}
