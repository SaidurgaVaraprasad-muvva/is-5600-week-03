const express = require("express"); // Express framework for building web applications
const EventEmitter = require("events"); // EventEmitter to manage custom events
const path = require("path"); // Path utility for handling file paths
const chatEmitter = new EventEmitter(); // Create an event emitter instance for chat messages
const port = process.env.PORT || 3000; // Set server port from environment or default to 3000
const app = express(); // Initialize an Express app

// Serve static files from the "public" folder
app.use(express.static(__dirname + "/public"));

// Define route handlers for the application
app.get("/", chatApp); // Serve the main chat application HTML page
app.get("/json", respondJson); // Respond with JSON data
app.get("/echo", respondEcho); // Echo input with transformations
app.get("/chat", respondChat); // Handle incoming chat messages
app.get("/sse", respondSSE); // Manage Server-Sent Events (SSE) for real-time updates

// Start server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Serve the main chat HTML file
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, "/chat.html")); // Send chat.html to the client
}

// Handle incoming chat messages and emit them to connected clients
function respondChat(req, res) {
  const { message } = req.query; // Retrieve message from the query parameters
  console.log({ message }); // Log the received message
  chatEmitter.emit("message", message); // Emit message event for SSE
  res.end(); // End the response without additional data
}

// Manage Server-Sent Events (SSE) connection for real-time updates
function respondSSE(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream", // Set content type to SSE
    Connection: "keep-alive", // Maintain open connection
  });

  // Listener function to send incoming messages to the SSE client
  const onMessage = (message) => res.write(`data: ${message}\n\n`);

  chatEmitter.on("message", onMessage); // Attach listener for message events

  // Remove listener when client disconnects
  res.on("close", () => {
    chatEmitter.off("message", onMessage);
  });
}

// Respond with a simple text message
function respondText(req, res) {
  res.setHeader("Content-Type", "text/plain"); // Set response content type
  res.end("hi"); // Send "hi" as the response
}

// Respond with a JSON object containing sample data
function respondJson(req, res) {
  res.json({
    text: "hi",
    numbers: [1, 2, 3], // Example array
  });
}

// Handle unknown routes with a 404 Not Found response
function respondNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" }); // Set response to 404 with plain text
  res.end("Not Found"); // Send "Not Found" as response
}

// Echo back the input with various transformations
function respondEcho(req, res) {
  const { input = "" } = req.query; // Get input from query parameters, default to empty string if missing
  res.json({
    normal: input, // Original input
    shouty: input.toUpperCase(), // Uppercase version of input
    charCount: input.length, // Character count of input
    backwards: input.split("").reverse().join(""), // Reversed input
  });
}