const ws = require("nodejs-websocket")

let server = ws.createServer((conn) => {
	console.log("new connnection")
	conn.on("text", (str) => {
		console.log(str)
		conn.sendText(str.toUpperCase())
	})
	conn.on("close", (code, reason) => {
		console.log("connnection closed")
	})
	conn.on("error", (err) => {
		console.log(err)
	})
})

const port = 8081
server.listen(port)
console.log("Successfully running on port "+ port)