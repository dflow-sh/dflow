import {
  BeszelClient,
  loginAsBeszelSuperuser,
  loginAsBeszelUser,
} from '../client/BeszelClient'
import { TypedBeszelHelpers } from '../client/typedHelpers'
import { Alert, Collections, User } from '../types'

/**
 * Example usage of the Beszel SDK
 */
export async function exampleUsage() {
  const url = 'https://monitoring.up.dflow.sh'
  const superuserEmail = 'admin@example.com'
  const superuserPassword = 'supersecret'
  const userEmail = 'user@example.com'
  const userPassword = 'usersecret'

  // ========== 1. Explicit Login (Recommended for full control) ==========

  // a) As superuser
  const beszelSuperuserClient = await loginAsBeszelSuperuser(
    url,
    superuserEmail,
    superuserPassword,
  )
  const superuserClient = new BeszelClient(beszelSuperuserClient)
  const superuserHelpers = new TypedBeszelHelpers(superuserClient)

  // b) As normal user
  const beszelUserClient = await loginAsBeszelUser(url, userEmail, userPassword)
  const userClient = new BeszelClient(beszelUserClient)
  const userHelpers = new TypedBeszelHelpers(userClient)

  // ========== 2. Auto-login via Constructor (Convenient, but async login) ==========

  // a) Superuser
  const autoSuperuserClient = new BeszelClient(url, {
    email: superuserEmail,
    password: superuserPassword,
    superuser: true,
  })
  // b) User
  const autoUserClient = new BeszelClient(url, {
    email: userEmail,
    password: userPassword,
    superuser: false,
  })

  // ========== 3. Async Factory for Guaranteed Authentication ==========

  // a) Superuser
  const factorySuperuserClient = await BeszelClient.createWithSuperuserAuth(
    url,
    superuserEmail,
    superuserPassword,
  )
  // b) User
  const factoryUserClient = await BeszelClient.createWithUserAuth(
    url,
    userEmail,
    userPassword,
  )

  // ========== 4. Typed Helpers for Collection-Specific Methods ==========

  // Use helpers for type-safe, convenient access
  const helpers = new TypedBeszelHelpers(factorySuperuserClient)

  // List users
  const users = await helpers.getUsers({ page: 1, perPage: 10 })
  // Create a user
  const newUser = await helpers.createUser({
    email: 'newuser@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    username: 'newuser',
    role: 'user',
    name: 'New User',
    emailVisibility: true,
    verified: true,
  })

  // List alerts
  const alerts = await helpers.getAlerts({ filter: 'triggered=true' })

  // ========== 5. Direct Client Usage (Generic, Flexible) ==========

  // List any collection generically
  const userList = await factorySuperuserClient.getList({
    collection: Collections.USERS,
    page: 1,
    perPage: 5,
  })

  // Create in any collection generically
  const createdAlert = await factorySuperuserClient.create({
    collection: Collections.ALERTS,
    data: {
      user: newUser.id,
      system: 'systemId',
      name: 'CPU High Usage',
      value: 95,
      min: 90,
      triggered: true,
    },
  })

  // ========== 6. Logout / Cleanup ==========

  // To clear auth state (optional, mostly for browser)
  beszelSuperuserClient.authStore.clear()

  // ========== 7. Type Safety and Autocomplete ==========

  // All helpers and client methods are fully typed!
  users.items.forEach((user: User) => {
    console.log(user.email, user.username)
  })
  alerts.items.forEach((alert: Alert) => {
    console.log(alert.name, alert.triggered)
  })

  // ========== 8. Error Handling ==========

  try {
    await helpers.createUser({
      email: 'bademail',
      password: 'short',
      passwordConfirm: 'short',
    })
  } catch (err) {
    console.error('Failed to create user:', err)
  }
}
