import http from 'http';
import app from './app.js';
import { config } from '@config/env.js';
import { connectDatabase } from '@config/database.js';

const Port = config.port || 5001;
const server = http.createServer(app);

server.on("error", (err: any) => {
  console.error("Server error:", err);
  process.exit(1);
})

connectDatabase()
.then(() => {
  server.on("error", (err) => {
    console.error("Express server error: ", err);
  })

  server.listen(Port, ()=> {
    console.log(`Server is running on port: ${Port} in ${config.nodeEnv} mode`);
  })
})
.catch((err: any) => {
  console.error("Failed to connect to the database: ", err);
  process.exit(1);
})