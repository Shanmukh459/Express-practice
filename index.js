const startupDebugger = require("debug")("app:startup")
const dbDebugger = require("debug")("app:db")
const config = require("config")
const morgan = require("morgan")
const helmet = require("helmet")
const Joi = require("joi")
const log = require("./logger")
const auth = require("./auth")
const express = require("express")
const app = express()

app.set("view engine", "pug")
app.set("views", "./views")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(helmet())

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

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
]

app.get("/", (req, res) => {
  res.render("index", { title: "My Express App", message: "Hello" })
})

app.get("/api/courses", (req, res) => {
  res.send(courses)
})

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id))
  if (!course)
    return res.status(404).send("The course with given id doesn't exist.")
  return res.send(course)
})

app.post("/api/courses", (req, res) => {
  const { error } = validateCourse(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const course = {
    id: courses.length + 1,
    name: req.body.name,
  }
  courses.push(course)
  res.send(course)
})

app.put("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id))
  if (!course) return res.status(404).send("The course doesn't exists.")

  const { error } = validateCourse(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  course.name = req.body.name
  res.send(course)
})

app.delete("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id))
  if (!course) return res.status(404).send("This course doesn't exist.")

  const index = courses.indexOf(course)
  courses.splice(index, 1)
  res.send(course)
})

function validateCourse(course) {
  console.log(course)
  const schema = {
    name: Joi.string().min(3).required(),
  }
  return Joi.validate(course, schema)
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})
