import { browser } from "k6/experimental/browser";

export const options = {
  ext: {
    loadimpact: {
      // Project: webApp2023
      projectID: __ENV.K6_PROJECT_ID,
      // Test runs with the same name groups test runs together
      name: "Frontend stress test",
    },
  },
  scenarios: {
    browser: {
      executor: "shared-iterations",
      vus: 2,
      iterations: 50,
      maxDuration: "10s",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

export default async function () {
  const page = browser.newPage();
  await page.goto("http://localhost:80/");
  const button = page.locator('[data-testid="ThumbUpIcon"]');
  await button.click();
}
