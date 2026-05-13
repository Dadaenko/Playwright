import {test as setup, expect} from '@playwright/test';

setup('Create a new article', async({request}) => {

    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
        "article":{"title":"Likes bonanza","description":"Wonderful news and many more","body":"Once upon a time...","tagList":["wow"]}
    },
  })
//   expect(articleResponse.status).toEqual(201)
  const response = await articleResponse.json()
  const slugId = response.article.slug
  process.env['SLUGID'] = slugId
})