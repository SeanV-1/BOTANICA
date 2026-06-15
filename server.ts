import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";

// Set default dns resolution order to prevent slow localhost fetches on some Node installations
dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy endpoint to retrieve Pinterest Pin info without CORS errors
  app.get("/api/pinterest-logo", async (req, res) => {
    try {
      const response = await fetch("https://www.pinterest.com/oembed.json?url=https://www.pinterest.com/pin/1140255199417507096/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
      });
      if (!response.ok) {
        throw new Error(`Pinterest fetch status: ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Pinterest API proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch Pin" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
