import {test as setup, expect} from '@playwright/test';

setup('Delete article with like', async({request}) =>{

    const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`, 
    {
    headers: {
      'Authorization': `Token ${process.env.ACCESS_TOKEN}`
    }
  }
  )
  expect(deleteArticleResponse.status()).toEqual(204)
})