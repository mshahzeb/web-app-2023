import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
  ext: {
    loadimpact: {
      // Project: webApp2023
      projectID: process.env.K6_PROJECT_ID,
      // Test runs with the same name groups test runs together
      name: "Open Web App 2023",
    },
  },
};

export default function () {
  http.get("http://localhost:80/");
  sleep(1);
}
