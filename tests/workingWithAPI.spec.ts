import {test, expect} from 'playwright/test';
import tags from '../test-data/tags.json'
import { request } from 'node:http';
import fs from 'fs'


test.beforeEach(async ({page}) => {

    await page.route('*/**/api/tags', async route => {
        await route.fulfill({
            body: JSON.stringify(tags)
        })
    })

    await page.goto('https://conduit.bondaracademy.com/')
})

test('Validate the presence of Conduit icon', async ({page}) => {
        await page.route('*/**/api/articles*', async route =>{
        const response = await route.fetch()
        const responseBody = await response.json()
        responseBody.articles[0].title = "This is a MOCK test title"
        responseBody.articles[0].description = "This MOCK description is amazing. Just wow"

        await route.fulfill({
            body: JSON.stringify(responseBody)
        })
    })

    await page.getByText('Global Feed').click()
    // await page.waitForTimeout(500)

    await expect(page.locator('.navbar-brand')).toHaveText('conduit')
    await page.waitForTimeout(500)
    await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title')
    await expect(page.locator('app-article-list p').first()).toContainText('This MOCK description is amazing. Just wow')
})

test('Delete article', async ({ page, request }) => {
  const response = await request.post(
    'https://conduit-api.bondaracademy.com/api/users/login',
    {
      data: {
        user: {
          email: process.env.API_EMAIL,
          password: process.env.API_PASSWORD
        }
      }
    }
  )

  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
        "article":{"title":"Amazing article","description":"Wonderful news and many more","body":"Once upon a time...","tagList":["wow"]}
    },
    headers: {
        Authorization: `Token ${accessToken}`
    }
  })
//   expect(articleResponse.status).toEqual(201)

await page.getByText('Global Feed').click()
await page.getByText('Amazing article').click()
await page.getByRole('button', {name: "Delete Article"}).first().click()
await page.getByText('Global Feed').click()

await expect(page.locator('app-article-list h1').first()).not.toContainText('Amazing article')

})

test('Create an article', async ({ page, request }) => {

  await page.getByText('New Article').click()
  await page.getByRole('textbox', { name: "Article Title" }).fill('Playwright is awesome')
  await page.getByRole('textbox', { name: "What's this article about?" }).fill('About the Playwright')
  await page.getByRole('textbox', { name: "Write your article (in markdown)" }).fill('We like using Playwright for automation')
  await page.getByRole('button', { name: "Publish Article" }).click()

  await expect(page).toHaveURL('https://conduit.bondaracademy.com/article')
  const articleResponse = await page.waitForResponse(
    'https://conduit.bondaracademy.com/articles'
  )

  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug

  await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome')

  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('.article-page').first()).toContainText('Playwright is awesome')

  const response = await request.post(
    '*/**/api/users/login',
    {
      data: {
        user: {
          email: process.env.API_EMAIL,
          password: process.env.API_PASSWORD
        }
      }
    }
  )

  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const deleteArticleResponse = await request.delete(
    `*/**/api/article/${slugId}`,
    {
      headers: {
        Authorization: `Token ${accessToken}`
      }
    }
  )

  expect(deleteArticleResponse.status()).toEqual(204)
})
