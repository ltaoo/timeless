const http = require("http");
const Database = require("better-sqlite3");

const PORT = process.env.PORT || 3001;
const dbPath = process.argv[2] || ":memory:";

const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create sample tables and data if in-memory
if (dbPath === ":memory:") {
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(255),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      status VARCHAR(20),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      post_id INTEGER NOT NULL REFERENCES posts(id),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL
    );

    CREATE TABLE post_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id),
      tag_id INTEGER NOT NULL REFERENCES tags(id)
    );
  `);

  // Insert sample data
  const insertUser = db.prepare(
    "INSERT INTO users (username, email, password, avatar, created_at) VALUES (?, ?, ?, ?, ?)",
  );
  const insertPost = db.prepare(
    "INSERT INTO posts (title, content, user_id, status, created_at) VALUES (?, ?, ?, ?, ?)",
  );
  const insertComment = db.prepare(
    "INSERT INTO comments (content, user_id, post_id, created_at) VALUES (?, ?, ?, ?)",
  );
  const insertTag = db.prepare("INSERT INTO tags (name) VALUES (?)");
  const insertPostTag = db.prepare(
    "INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)",
  );

  const insertAll = db.transaction(() => {
    // Users
    const users = [
      ["alice", "alice@example.com", "hash_123", null, "2024-01-15 10:30:00"],
      ["bob", "bob@example.com", "hash_456", null, "2024-02-20 14:00:00"],
      [
        "charlie",
        "charlie@example.com",
        "hash_789",
        "/avatars/charlie.png",
        "2024-03-10 09:15:00",
      ],
      ["diana", "diana@example.com", "hash_abc", null, "2024-04-05 16:45:00"],
      ["eve", "eve@example.com", "hash_def", null, "2024-05-12 11:20:00"],
    ];
    for (const u of users) insertUser.run(...u);

    // Posts
    const posts = [
      [
        "Getting Started with SQLite",
        "A comprehensive guide to using SQLite in your projects.",
        1,
        "published",
        "2024-06-01 08:00:00",
      ],
      [
        "Advanced Query Techniques",
        "Learn about window functions and CTEs.",
        2,
        "draft",
        "2024-06-15 12:30:00",
      ],
      [
        "Database Design Patterns",
        "Common patterns for relational database design.",
        1,
        "published",
        "2024-07-01 10:00:00",
      ],
      [
        "Performance Tuning Tips",
        "How to optimize your SQL queries for better performance.",
        3,
        "published",
        "2024-07-10 14:00:00",
      ],
      [
        "Security Best Practices",
        "Keep your database secure with these tips.",
        4,
        "review",
        "2024-07-20 09:00:00",
      ],
    ];
    for (const p of posts) insertPost.run(...p);

    // Comments
    const comments = [
      ["Great article! Very helpful.", 2, 1, "2024-06-02 10:00:00"],
      ["Thanks for sharing this.", 3, 1, "2024-06-03 11:30:00"],
      ["I learned a lot from this.", 4, 2, "2024-06-16 14:00:00"],
      ["Could you cover indexes too?", 5, 2, "2024-06-17 09:00:00"],
      ["This is exactly what I needed.", 1, 3, "2024-07-02 15:00:00"],
      ["Well written!", 2, 3, "2024-07-03 08:30:00"],
      ["Bookmarked for later.", 3, 4, "2024-07-11 12:00:00"],
      ["Nice performance tips.", 5, 4, "2024-07-12 16:00:00"],
    ];
    for (const c of comments) insertComment.run(...c);

    // Tags
    const tags = [
      ["sqlite"],
      ["database"],
      ["tutorial"],
      ["performance"],
      ["security"],
    ];
    for (const t of tags) insertTag.run(t);

    // Post-Tags
    insertPostTag.run(1, 1);
    insertPostTag.run(1, 3);
    insertPostTag.run(2, 1);
    insertPostTag.run(2, 2);
    insertPostTag.run(3, 1);
    insertPostTag.run(3, 2);
    insertPostTag.run(4, 4);
    insertPostTag.run(5, 5);
  });

  insertAll();
}

console.log(`Database loaded: ${dbPath === ":memory:" ? "in-memory" : dbPath}`);

// API server
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse body for POST requests
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      const parsed = body ? JSON.parse(body) : {};

      if (req.url === "/api/v1/database/tables" && req.method === "POST") {
        const tables = db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
          )
          .all();

        const result = tables.map((t) => {
          const cols = db
            .prepare(`PRAGMA table_info("${t.name}")`)
            .all();
          const columns = cols.map((c) => ({
            cid: c.cid,
            name: c.name,
            type: c.type,
            notnull: c.notnull === 1,
            dflt_value: c.dflt_value,
            pk: c.pk === 1,
          }));
          const raw = cols;
          return { name: t.name, columns, raw };
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: 0, error: "", data: result }));
      } else if (
        req.url === "/api/v1/database/exec" &&
        req.method === "POST"
      ) {
        const { query } = parsed;
        if (!query) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ code: 1, msg: "Missing query", data: [] }),
          );
          return;
        }

        // Only allow SELECT queries for safety
        const trimmed = query.trim().toUpperCase();
        if (
          !trimmed.startsWith("SELECT") &&
          !trimmed.startsWith("PRAGMA") &&
          !trimmed.startsWith("EXPLAIN")
        ) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              code: 1,
              msg: "Only SELECT queries are allowed",
              data: [],
            }),
          );
          return;
        }

        const rows = db.prepare(query).all();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: 0, msg: "", data: rows }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
      }
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ code: 1, msg: err.message, data: [] }),
      );
    }
  });
});

server.listen(PORT, () => {
  console.log(`API server listening on http://127.0.0.1:${PORT}`);
});
