import fs from 'fs'
import { Builder, By, until } from 'selenium-webdriver'

const BASE_URL = 'http://localhost:3000'
const EMAIL = 'dev@resonateaes.com'
const PASSWORD = 'ContentQL@123'

const results = []

async function testSignInPage() {
  let driver = await new Builder().forBrowser('chrome').build()
  try {
    await driver.get(`${BASE_URL}/sign-in`)
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Sign In')]")),
      5000,
    )
    results.push({ test: 'Sign-In Page Loads', success: true })
  } catch (err) {
    results.push({
      test: 'Sign-In Page Loads',
      success: false,
      error: err.message,
    })
  } finally {
    await driver.quit()
  }
}

async function testLogin() {
  let driver = await new Builder().forBrowser('chrome').build()
  try {
    await driver.get(`${BASE_URL}/sign-in`)
    await driver.findElement(By.name('email')).sendKeys(EMAIL)
    await driver.findElement(By.name('password')).sendKeys(PASSWORD)
    await driver
      .findElement(By.xpath("//button[contains(., 'Sign In')]"))
      .click()
    await driver.wait(until.urlContains('/dashboard'), 10000)
    results.push({ test: 'Login Works', success: true })
  } catch (err) {
    results.push({ test: 'Login Works', success: false, error: err.message })
  } finally {
    await driver.quit()
  }
}

async function testForgotPasswordPage() {
  let driver = await new Builder().forBrowser('chrome').build()
  try {
    await driver.get(`${BASE_URL}/forgot-password`)
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Reset Password')]")),
      5000,
    )
    results.push({ test: 'Forgot Password Page Loads', success: true })
  } catch (err) {
    results.push({
      test: 'Forgot Password Page Loads',
      success: false,
      error: err.message,
    })
  } finally {
    await driver.quit()
  }
}

async function testSignUpPage() {
  let driver = await new Builder().forBrowser('chrome').build()
  try {
    await driver.get(`${BASE_URL}/sign-up`)
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Sign Up')]")),
      5000,
    )
    results.push({ test: 'Sign-Up Page Loads', success: true })
  } catch (err) {
    results.push({
      test: 'Sign-Up Page Loads',
      success: false,
      error: err.message,
    })
  } finally {
    await driver.quit()
  }
}

async function testDashboardAfterLogin() {
  let driver = await new Builder().forBrowser('chrome').build()
  try {
    await driver.get(`${BASE_URL}/sign-in`)
    await driver.findElement(By.name('email')).sendKeys(EMAIL)
    await driver.findElement(By.name('password')).sendKeys(PASSWORD)
    await driver
      .findElement(By.xpath("//button[contains(., 'Sign In')]"))
      .click()
    await driver.wait(until.urlContains('/dashboard'), 10000)
    // Wait for Projects heading
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Projects')]")),
      5000,
    )
    results.push({ test: 'Dashboard Loads After Login', success: true })
  } catch (err) {
    results.push({
      test: 'Dashboard Loads After Login',
      success: false,
      error: err.message,
    })
  } finally {
    await driver.quit()
  }
}

async function runAllTests() {
  await testSignInPage()
  await testLogin()
  await testForgotPasswordPage()
  await testSignUpPage()
  await testDashboardAfterLogin()
  fs.writeFileSync(
    'selenium_test_results.json',
    JSON.stringify(results, null, 2),
  )
  console.log('Test results written to selenium_test_results.json')
}

runAllTests()
