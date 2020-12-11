if (process.env.NODE_ENV?.trim() === "development") {
    require("./dev");
} else {
    require("./prod");
}
