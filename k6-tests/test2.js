import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 1000,
  duration: "10s",
  ext: {
    loadimpact: {
      // Project: webApp2023
      projectID: __ENV.K6_PROJECT_ID,
      // Test runs with the same name groups test runs together
      name: "Backend stress test",
    },
  },
};

export default function () {
  http.post("http://localhost:8080/add_vote");
  http.get("http://localhost:8080/count_votes");
  http.get("http://localhost:8080/get_votes");
  sleep(0.01);
}
