const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const HTTP_STATUS = {
  200: "HTTP/1.1 200 OK\r\n\r\n",
  404: "HTTP/1.1 404 NOT FOUND\r\n\r\n"
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const path = data.toString().split(" ")[1];
    switch(path) {
      case "/":
        socket.write(HTTP_STATUS[200]);
        break;
      default:
        socket.write(HTTP_STATUS[404]);
    }
  });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
