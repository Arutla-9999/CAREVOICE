import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";
import path from "node:path";
import { WebSocketServer } from "ws";
import { respond, report } from "./services/ai.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_, res) => {
  res.json({
    ok: true,
    service: "voice-health-screener",
  });
});

// Frontend production files
const dist = path.join(process.cwd(), "dist");

app.use(express.static(dist));

app.get("*splat", (_, res) => {
  res.sendFile(path.join(dist, "index.html"));
});

// HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

type Turn = {
  role: "user" | "assistant";
  content: string;
};

wss.on("connection", (ws) => {
  let history: Turn[] = [];
  let active = false;

  ws.on("message", async (raw) => {
    try {
      const m = JSON.parse(raw.toString());

      // Start screening
      if (m.event === "START_CALL") {
        active = true;
        history = [];

        const greeting =
          "Hello, I’m CareVoice. I’ll ask a few simple questions to understand what you’re experiencing. What is your name?";

        history.push({
          role: "assistant",
          content: greeting,
        });

        ws.send(
          JSON.stringify({
            event: "STATUS",
            data: "Listening",
          })
        );

        ws.send(
          JSON.stringify({
            event: "AGENT_TEXT",
            text: greeting,
          })
        );

        return;
      }

      // User sends text
      if (m.event === "USER_TEXT" && active) {
        const text = String(m.text || "").trim();

        if (!text) {
          return;
        }

        history.push({
          role: "user",
          content: text,
        });

        ws.send(
          JSON.stringify({
            event: "TRANSCRIPT_UPDATE",
            role: "user",
            text,
          })
        );

        ws.send(
          JSON.stringify({
            event: "STATUS",
            data: "Thinking",
          })
        );

        const reply = await respond(history);

        history.push({
          role: "assistant",
          content: reply,
        });

        ws.send(
          JSON.stringify({
            event: "AGENT_TEXT",
            text: reply,
          })
        );

        ws.send(
          JSON.stringify({
            event: "STATUS",
            data: "Listening",
          })
        );

        return;
      }

      // End screening
      if (m.event === "END_CALL" && active) {
        active = false;

        ws.send(
          JSON.stringify({
            event: "STATUS",
            data: "Generating report",
          })
        );

        const finalReport = await report(history);

        ws.send(
          JSON.stringify({
            event: "FINAL_REPORT",
            report: finalReport,
          })
        );

        ws.send(
          JSON.stringify({
            event: "STATUS",
            data: "Complete",
          })
        );
      }
    } catch (error) {
      console.error(error);

      ws.send(
        JSON.stringify({
          event: "ERROR",
          message:
            "Something went wrong while processing that turn. Please try again.",
        })
      );
    }
  });
});

// Render provides PORT automatically
const port = Number(process.env.PORT || 10000);

server.listen(port, "0.0.0.0", () => {
  console.log(`CareVoice listening on ${port}`);
});
