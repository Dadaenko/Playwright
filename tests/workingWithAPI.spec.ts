import {test, expect} from 'playwright/test';
import tags from '../test-data/tags.json'

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