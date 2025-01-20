const startupDebugger = require("debug")("app:startup")
const dbDebugger = require("debug")("app:db")
const config = require("config")
const morgan = require("morgan")
const helmet = require("helmet")
const Joi = require("joi")
const log = require("./middleware/logger")
const courses = require("./routes/courses")
const home = require("./routes/home")
const auth = require("./auth")
const express = require("express")
const app = express()

app.set("view engine", "pug")
app.set("views", "./views")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(helmet())

app.use("/", home)
app.use("/api.courses", courses)

console.log(`Application name: ${config.get("name")}`)
console.log(`Mail server: ${config.get("mail.host")}`)
console.log(`Mail password: ${config.get("mail.password")}`)

if (app.get("env") === "development") {
  app.use(morgan("tiny"))
  startupDebugger("Morgan enabled...")
}

// Some db work...
dbDebugger("connected to database...")

app.use(log)
app.use(auth)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})
