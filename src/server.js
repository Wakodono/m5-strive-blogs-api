import express from "express" // NEW IMPORT SYNTAX (remember to add type: "module" in package.json to use new syntax)
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"

import authorsRouter from "./services/authors/index.js"
import blogsRouter from "./services/blogs/index.js"

import { genericErrorHandler, badRequestHandler, unauthorizedHandler, notFoundHandler } from "./errorHandlers.js"

const server = express()

const publicFolderPath = join(process.cwd(), "./public")

// console.log(process.env)

const whitelist = [process.env.FE_LOCAL_URL, process.env.FE_PROD_URL]
const corsOpts = {
  origin: function (origin, next) {
    // Since CORS is a global middleware, it is going to be executed for each and every request --> we are able to "detect" the origin of each and every req from this function
    console.log("CURRENT ORIGIN: ", origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      // If origin is in the whitelist or if the origin is undefined () --> move ahead
      next(null, true)
      // next(null, true) is the next step. You might have to ask Ricardo to tell you why bro
    } else {
      // If origin is NOT in the whitelist --> trigger a CORS error
      next(new Error("CORS ERROR"))
    }
  },
}

server.use(express.static(publicFolderPath))

server.use(cors(corsOpts)) // You need this line to make the FRONTEND communicate with the BACKEND

server.use(express.json()) // If I do NOT specify this line BEFORE the endpoints, all the requests' bodies will be UNDEFINED

// *********************** ENDPOINTS ***************************
server.use("/authors", authorsRouter) // all of the endpoints which are in the authorsRouter will have /authors as a prefix

server.use("/blogs", blogsRouter) // all endpoints in the blogsRouter will have /blogs as a prefix

// *********************** ERROR MIDDLEWARES ***************************

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

const port = process.env.PORT

console.table(listEndpoints(server))

server.listen(port, () => {
  console.log("Server running on port:", port)
})

server.on("error", (error) => console.log(`Server is not running: ${error}`))