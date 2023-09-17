import { browser } from "k6/experimental/browser";

export const options = {
  ext: {
    loadimpact: {
      // Project: webApp2023
      projectID: 3659118,
      // Test runs with the same name groups test runs together
      name: "Frontend stress test",
    },
  },
  scenarios: {
    browser: {
      executor: "shared-iterations",
      vus: 2,
      iterations: 50,
      maxDuration: "100s",
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
