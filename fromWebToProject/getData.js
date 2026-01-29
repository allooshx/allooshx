const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const MAX_PAGES = parseInt(process.env.MAX_PAGES || "10", 10);
const OUTPUT_FILE = process.env.OUTPUT_FILE || "pageData.json";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processPage(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const news = [];

  // Extract posts on this page
  $('article, .post').each((i, el) => {
    const title = $(el).find('.post-title a').first().text().trim();
    const link = $(el).find('.post-title a').first().attr('href');

    const date =
      $(el).find('abbr.published').attr('title') ||
      $(el).find('time.published').attr('datetime') ||
      $(el).find('abbr').attr('title') ||
      $(el).find('time').attr('datetime') ||
      null;

    if (title && link) {
      news.push({ title, link, date });
    }
  });

  // Next page link (older news)
  const nextPageLink = $('#blog-pager-older-link a').attr('href') || null;

  return { posts: news, nextPageLink };
}

async function main() {
  const pages = [];

  const startUrl =
  'https://www.motqdmon.com/search/label/%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A7%D8%AA?max-results=10';


  try {
    const response1 = await axios.get(startUrl);
    const pageData1 = await processPage(response1.data);
    pages.push(...pageData1.posts);

    let nextUrl = pageData1.nextPageLink;

    for (let i = 2; i <= MAX_PAGES; i++) {
      if (!nextUrl) break;

      const response = await axios.get(nextUrl);
      const pageData = await processPage(response.data);
      pages.push(...pageData.posts);

      nextUrl = pageData.nextPageLink;

      await sleep(150); // be nice
    }

    // Dedupe by link
    const unique = new Map();
    for (const p of pages) unique.set(p.link, p);
    const finalPages = Array.from(unique.values());

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalPages, null, 2), "utf-8");
    console.log(`Saved ${finalPages.length} posts to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Error in main execution:', err.message);
  }
}

module.exports = main;
