import { Builder, By, until } from 'selenium-webdriver'

const example = async () => {
  let driver = await new Builder().forBrowser('chrome').build()
  try {
    await driver.get('http://localhost:3000/sign-in')

    // Fill in email
    await driver.findElement(By.name('email')).sendKeys('dev@resonateaes.com')
    // Fill in password
    await driver.findElement(By.name('password')).sendKeys('ContentQL@123')
    // Click the Sign In button
    await driver
      .findElement(By.xpath("//button[contains(., 'Sign In')]"))
      .click()

    // Wait for a post-login element (e.g., dashboard, or a unique element/text)
    // Example: wait for a dashboard heading or user avatar
    await driver.wait(until.urlContains('/dashboard'), 10000)
    console.log('Test passed: Login successful and dashboard loaded')
  } catch (err) {
    console.error('Test failed:', err)
  } finally {
    await driver.quit()
  }
}

example()
