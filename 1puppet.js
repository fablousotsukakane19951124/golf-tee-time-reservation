const puppeteer = require("puppeteer");

const my_info = {
  test: {
    name: "eliert0327",
    passwd: "PICpic123!@#",
    url: "https://cityofla.ezlinksgolf.com/",
  },
  real: {
    name: "la-134554",
    passwd: "hrx7xbe!epj.wkz3DBK",
    url: "https://cityoflapcp.ezlinksgolf.com/",
  },
};

const min_wait_time = 1000;
const default_wait_time = 3000;
const medium_wait_time = 5000;
const retry_time = 1000 * 60 * 10;

async function main() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 720 });
    const booking_info = my_info.real;

    await page.goto(`${booking_info.url}/index.html#/login`, {
      waitUntil: "networkidle0",
    }); // wait until page load
    await page.type("input[type=text]", booking_info.name);
    await page.type("input[type=password]", booking_info.passwd);
    // click and wait for navigation
    await Promise.all([
      page.click("button[type=submit]"),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    await wait(default_wait_time);

    const dateInput = await page.$("#dateInput");

    await dateInput.click({ clickCount: 3 });
    await dateInput.type("Blah");

    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const daysUntilWeekend =
      currentDay >= 7 ? 7 - currentDay + 6 : 6 - currentDay;
    const thisWeekend = new Date(
      currentDate.setDate(currentDate.getDate() + daysUntilWeekend)
    );

    const year = thisWeekend.getFullYear();
    const month = (thisWeekend.getMonth() + 1).toString().padStart(2, "0");
    const day = thisWeekend.getDate().toString().padStart(2, "0");
    const formattedDate = `${month}/${day}/${year}`;
    await dateInput.type(formattedDate);
    // await dateInput.type("05/16/2023");

    await Promise.all([
      page.click("button[type=submit]"),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    await wait(default_wait_time);
    await page.hover("div.ngrs-handle-min");
    await wait(min_wait_time);
    await page.mouse.down();
    await page.mouse.move(105, 19);
    await page.mouse.up();

    await wait(default_wait_time);
    await page.hover("div.ngrs-handle-max");
    await wait(min_wait_time);
    await page.mouse.down();
    await page.mouse.move(155, 19);
    await page.mouse.up();

    await wait(default_wait_time);
    await page.evaluate(() => {
      const tds = Array.from(
        document.querySelectorAll("ul.dropdown-menu li a")
      );

      tds.map((td) => {
        var txt = td.innerHTML;

        if (txt == "18") {
          td.click();
        }
      });
    });

    await wait(default_wait_time);
    await page.evaluate(() => {
      const elems = Array.from(
        document.querySelectorAll("div.search-select-div a")
      );

      elems.map((td) => {
        var txt = td.innerHTML;

        if (txt == "Clear All") {
          td.click();
        }
      });
    });

    await wait(default_wait_time);
    await page.$eval("[id='courseName_Rancho Park']", (el) => el.click());
    await wait(default_wait_time);
    await autoScroll(page);

    try {
      await wait(default_wait_time);
      await page.$eval(".player-info button:last-child", (el) => el.click());
    } catch (err) {
      await wait(default_wait_time);
      await page.$eval("[id='courseName_Griffith Park - Wilson']", (el) =>
        el.click()
      );
      await wait(default_wait_time);
      await autoScroll(page);
      try {
        await wait(default_wait_time);
        await page.$eval(".player-info button:last-child", (el) => el.click());
      } catch (err) {
        await wait(default_wait_time);
        await page.$eval("[id='courseName_Griffith Park - Harding']", (el) =>
          el.click()
        );
        await wait(default_wait_time);
        await autoScroll(page);
        try {
          await wait(default_wait_time);
          await page.$eval(".player-info button:last-child", (el) =>
            el.click()
          );
        } catch (err) {
          try {
            await wait(default_wait_time);
            await page.evaluate(() => {
              const elems = Array.from(
                document.querySelectorAll("div.search-select-div a")
              );

              elems.map((td) => {
                var txt = td.innerHTML;

                if (txt == "Select All") {
                  td.click();
                }
              });
            });
            await wait(default_wait_time);
            await page.$eval(".player-info button:last-child", (el) =>
              el.click()
            );
          } catch (e) {
            await browser.close();
            await wait(retry_time);
            main();
            return;
          }
        }
      }
    }

    await wait(default_wait_time);
    await page.$eval("#addToCartBtn", (el) => el.click());

    await wait(medium_wait_time);
    try {
      const searchValue = await page.$eval(
        ".confirm-modal div.ng-binding",
        (el) => el.innerHTML
      );
      if (searchValue.indexOf("You Have An Existing Reservation") >= 0) {
        console.log("You've already reserved.");
        await browser.close();
        await wait(medium_wait_time * 12 * 60 * 24); // 1 day
        main();
        return;
      }
      await page.$eval(".confirm-modal button", (el) => el.click());
    } catch (err) {
      console.log(err);
    }

    try {
      await wait(default_wait_time);
      await page.$eval(".tokenex_submit", (el) => el.click());
    } catch (err) {
      console.log(err);
    }

    await wait(default_wait_time);
    await page.$eval("#topFinishBtn", (el) => el.click());

    await wait(default_wait_time);

    await browser.close();
    await wait(retry_time);
    main();
  } catch (err) {
    console.log(err);
    try {
      await browser.close();
      await wait(retry_time);
    } catch {}
    main();
  }
}

async function wait(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

main();
