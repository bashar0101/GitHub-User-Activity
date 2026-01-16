#!/usr/bin/env node

const https = require("https");

const username = process.argv[2];

if (!username) {
  console.error("Please provide a GitHub username.");
  console.log("Usage: github-activity <username>");
  process.exit(1);
}

const options = {
  hostname: "api.github.com",
  path: `/users/${username}/events/public`,
  headers: {
    "User-Agent": "github-activity-cli",
  },
};

https
  .get(options, (res) => {
    let data = "";

    if (res.statusCode !== 200) {
      console.error(`Failed to fetch data (status ${res.statusCode})`);
      process.exit(1);
    }

    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const events = JSON.parse(data);

      if (events.length === 0) {
        console.log("No recent activity found.");
        return;
      }

      console.log(`Recent activity for ${username}:\n`);

      events.slice(0, 10).forEach((event) => {
        switch (event.type) {
          case "PushEvent":
            console.log(`- Pushed to ${event.repo.name}`);
            break;
          case "IssuesEvent":
            console.log(
              `- ${event.payload.action} an issue in ${event.repo.name}`,
            );
            break;
          case "PullRequestEvent":
            console.log(
              `- ${event.payload.action} a pull request in ${event.repo.name}`,
            );
            break;
          default:
            console.log(`- ${event.type} in ${event.repo.name}`);
        }
      });
    });
  })
  .on("error", () => {
    console.error("Network error");
  });
