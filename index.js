const ws = require("nodejs-websocket")

let clientCount = 0
let msgIndex = 0

let server = ws.createServer((conn) => {
	clientCount++
	console.log("用户"+clientCount+"连接")
	conn.nickname = '用户'+clientCount
	broadcast(conn.nickname+"加入了", "系统")
	conn.on("text", (str) => {
		broadcast(str, conn.nickname)
	})
	conn.on("close", (code, reason) => {
		console.log(conn.nickname+"连接关闭")
		broadcast(conn.nickname+"离开", "系统")
	})
	conn.on("error", (err) => {
		console.log(err)
	})
})

const broadcast = (str, nickname) => {
	msgIndex++
	let data = {
		index: msgIndex,
		content: str,
		user: nickname
	}
	server.connections.forEach((connection) => {
		connection.sendText(JSON.stringify(data))
	})
}

const port = 8082
server.listen(port)
console.log("Successfully running on port "+ port)