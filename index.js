#!/usr/bin/env node

import { select, Separator } from "@inquirer/prompts";
import open, { apps } from "open";
import { createSpinner } from "nanospinner";

const selectBlogProvider = async () => {
  const selectedBlogProvider = await select({
    message: "Select a blogs provider",
    pageSize: 3,
    loop: false,
    choices: [
      {
        name: "Dev Community",
        value: "dev.to",
        description:
          "\n Description: A constructive and inclusive social network for software developers. With you every step of your journey.",
      },
      new Separator("----------------------"),
    ],
  });

  return selectedBlogProvider;
};

const fetchDevtoArticleList = async (page = 1) => {
  try {
    const spinner = createSpinner("Fetching Dev Community articles").start();
    const response = await fetch(
      `https://dev.to/api/articles?per_page=15&page=${page}`
    );
    if (!response.ok) {
      throw new Error("Network Error");
    }
    const articles = await response.json();
    const reducedArticleList = await articles.map((article) => {
      return {
        name: article.title,
        value: article.url,
        description: `\n Description: ${article.description}`,
      };
    });
    spinner.success({ text: "Dev Community Articles" });
    return reducedArticleList;
  } catch (error) {}
};

const selectComponent = async (choices, pageNumber) => {
  while (true) {
    try {
      const previous = {
        name: "<Previous",
        value: "-1",
        description: `go to previous page ${pageNumber - 1}`,
        disabled: pageNumber <= 1 ? true : false,
      };
      const next = {
        name: "Next>",
        value: "+1",
        description: `go to next page ${pageNumber + 1}`,
      };

      const articleLink = await select({
        message: "Select article to open",
        pageSize: 20,
        loop: false,
        choices: [
          ...choices,
          new Separator("----- Pagination -----"),
          previous,
          next,
          new Separator("----------------------"),
        ],
      });

      if (articleLink === "-1") {
        await devtoArticle(pageNumber - 1);
      } else if (articleLink === "+1") {
        await devtoArticle(pageNumber + 1);
      } else {
        await open(articleLink, {
          app: { name: [apps.browser, apps.firefox, apps.chrome] },
        });
      }
    } catch (error) {}
  }
};

const devtoArticle = async (pageNumber) => {
  try {
    const articleList = await fetchDevtoArticleList(pageNumber);
    await selectComponent(articleList, pageNumber);
  } catch (error) {}
};

const main = async () => {
  try {
    const blogProvider = await selectBlogProvider();
    if (blogProvider === "dev.to") {
      await devtoArticle(1);
    }
  } catch (error) {}
};

main();
