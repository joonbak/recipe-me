import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { message } = await request.json();
  try {
    new URL(message);
  } catch (e) {
    return Response.json(
      {
        error: "Invalid URL format",
      },
      { status: 400 }
    );
  }

  const html = await scrapeRecipeWebpage(message);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
          Read the following HTML carefully and extract the recipe information.
          If the webpage is not a recipe, return an empty JSON object.
          For the steps, make them concise and highlight important parts by wrapping them in **asterisks**.
          
          Return a JSON object with:
          - ingredients (as an array with bold markers on key words)
          - steps (as an array of steps with bold markers)
          
          Return only the JSON object, no markdown formatting or backticks.
        `.trim(),
      },
      { role: "user", content: html },
    ],
  });

  const reply = response.choices[0].message.content;
  const parsedReply = JSON.parse(reply);

  return Response.json({
    message: parsedReply,
  });
}

async function scrapeRecipeWebpage(url) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const extractedText = await page.$eval("*", (el) => el.innerText);
  await browser.close();
  return extractedText;
}
