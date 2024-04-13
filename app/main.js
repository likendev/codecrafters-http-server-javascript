const net = require("net");
const fs = require("fs");
const pathModule = require("path");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const HTTP_STATUS = {
  200: "HTTP/1.1 200 OK\r\n\r\n",
  404: "HTTP/1.1 404 NOT FOUND\r\n\r\n",
};

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString().split("\r\n");
    const [method, path] = request[0].split(" ");
    const userAgent = request[2].split(" ");

    if (method === "GET" && path.startsWith("/echo")) {
      const content = path.split("/echo/")[1];

      socket.write("HTTP/1.1 200 OK\r\n");
      socket.write("Content-Type: text/plain\r\n");
      socket.write(`Content-Length: ${content.length}\r\n`);
      socket.write(`\r\n${content}\r\n`);
    } else if (method === "GET" && path.startsWith("/user-agent")) {
      socket.write("HTTP/1.1 200 OK\r\n");
      socket.write("Content-Type: text/plain\r\n");
      socket.write(`Content-Length: ${userAgent[1].length}\r\n`);
      socket.write(`\r\n${userAgent[1]}\r\n`);
    } else if (method === "GET" && path.startsWith("/files")) {
      const content = path.split("/files/")[1];

      const dirArg = process.argv.findIndex((el) => el === "--directory");
      if (dirArg === -1) {
        socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        return;
      }
      const directory = process.argv[dirArg + 1];
      const [, filename] = path.split("/files/");
      const filePath = pathModule.join(directory, filename);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath).toString("utf-8");
        socket.write("HTTP/1.1 200 OK\r\n");
        socket.write("Content-Type: application/octet-stream\r\n");
        socket.write(`Content-Length: ${fileContent.length}\r\n`);
        socket.write("\r\n");
        socket.write(fileContent);
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        1;
      }
    } else if (method === "POST" && path.startsWith("/files")) {
      let content = request[request.length - 1];
      const fileName = path.replace("/files/", "");
      const directory = process.argv[3] ?? __dirname;
      const filePath = pathModule.join(directory, fileName);
      fs.writeFileSync(filePath, content);
      socket.write("HTTP/1.1  201 OK\r\n");
      socket.write("Content-Type: application/octet-stream\r\n");
      1;
      socket.write(`Content-Length: ${content.length}\r\n\r\n`);
    }
    if (path === "/") {
      socket.write(HTTP_STATUS[200]);
    } else {
      socket.write(HTTP_STATUS[404]);
    }
    socket.end();
  });
  socket.on("close", () => {
    // socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
