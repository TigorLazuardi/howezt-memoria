require("module-alias/register");

if (process.env.NODE_ENV?.trim() === "development") {
    require("./dev");
} else {
    require("./prod");
}
