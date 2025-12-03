import { createServer } from "@vercel/node";
import app from "./src/index";

export default createServer(app);
