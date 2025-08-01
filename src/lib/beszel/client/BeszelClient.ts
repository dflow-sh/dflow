import {
  CollectionCreateData,
  CollectionRecord,
  CollectionUpdateData,
  Collections,
  PocketBaseListResult,
} from '../types'
import PocketBase from 'pocketbase'

import {
  CreateParams,
  DeleteParams,
  FirstListItemParams,
  FullListParams,
  GetOneParams,
  ListParams,
  UpdateParams,
} from './interfaces'

// Explicit login helpers
export async function loginAsBeszelUser(
  url: string,
  email: string,
  password: string,
): Promise<PocketBase> {
  const pb = new PocketBase(url)
  await pb.collection('users').authWithPassword(email, password)
  return pb
}

export async function loginAsBeszelSuperuser(
  url: string,
  email: string,
  password: string,
): Promise<PocketBase> {
  const pb = new PocketBase(url)
  await pb.collection('_superusers').authWithPassword(email, password)
  return pb
}

export class BeszelClient {
  private pb: PocketBase

  constructor(
    monitoringUrlOrPb: string | PocketBase,
    opts?: { email?: string; password?: string; superuser?: boolean },
  ) {
    if (typeof monitoringUrlOrPb === 'string') {
      this.pb = new PocketBase(monitoringUrlOrPb)

      // Auto-login if credentials are provided
      if (opts?.email && opts?.password) {
        const loginPromise = opts.superuser
          ? this.pb
              .collection('_superusers')
              .authWithPassword(opts.email, opts.password)
          : this.pb
              .collection('users')
              .authWithPassword(opts.email, opts.password)

        // Note: This is async, so the client won't be fully authenticated until the promise resolves
        loginPromise.catch(error => {
          console.error('Auto-login failed:', error)
        })
      }
    } else {
      this.pb = monitoringUrlOrPb
    }
  }

  /**
   * Static factory method to create a client with guaranteed superuser authentication
   */
  static async createWithSuperuserAuth(
    url: string,
    email: string,
    password: string,
  ): Promise<BeszelClient> {
    const pb = await loginAsBeszelSuperuser(url, email, password)
    return new BeszelClient(pb)
  }

  /**
   * Static factory method to create a client with guaranteed user authentication
   */
  static async createWithUserAuth(
    url: string,
    email: string,
    password: string,
  ): Promise<BeszelClient> {
    const pb = await loginAsBeszelUser(url, email, password)
    return new BeszelClient(pb)
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid
  }

  /**
   * Get the currently logged-in user model
   */
  getCurrentUser(): any | null {
    return this.pb.authStore.model
  }

  /**
   * Get the authentication token
   */
  getAuthToken(): string {
    return this.pb.authStore.token
  }

  /**
   * Get user ID of currently logged-in user
   */
  getCurrentUserId(): string | null {
    return this.pb.authStore.model?.id || null
  }

  /**
   * Get user email of currently logged-in user
   */
  getCurrentUserEmail(): string | null {
    return this.pb.authStore.model?.email || null
  }

  /**
   * Check if current user is a superuser
   */
  isSuperuser(): boolean {
    return this.pb.authStore.model?.collectionName === '_superusers'
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.pb.authStore.clear()
  }

  /**
   * Get paginated list of records
   */
  async getList<T extends Collections = Collections>({
    collection,
    page = 1,
    perPage = 30,
    sort = '-created',
    filter = '',
    expand,
    fields,
    skipTotal = false,
  }: Omit<ListParams, 'collection'> & { collection: T }): Promise<
    PocketBaseListResult<CollectionRecord<T>>
  > {
    return await this.pb.collection(collection).getList(page, perPage, {
      filter,
      sort,
      expand,
      fields,
      skipTotal,
    })
  }

  /**
   * Get all records at once
   */
  async getFullList<T extends Collections = Collections>({
    collection,
    sort = '-created',
    filter = '',
    expand,
    fields,
  }: Omit<FullListParams, 'collection'> & { collection: T }): Promise<
    CollectionRecord<T>[]
  > {
    return await this.pb.collection(collection).getFullList({
      filter,
      sort,
      expand,
      fields,
    })
  }

  /**
   * Get first record that matches filter
   */
  async getFirstListItem<T extends Collections = Collections>({
    collection,
    filter,
    expand,
    fields,
  }: Omit<FirstListItemParams, 'collection'> & { collection: T }): Promise<
    CollectionRecord<T>
  > {
    return await this.pb.collection(collection).getFirstListItem(filter, {
      expand,
      fields,
    })
  }

  /**
   * Get single record by ID
   */
  async getOne<T extends Collections = Collections>({
    collection,
    id,
    expand,
    fields,
  }: Omit<GetOneParams, 'collection'> & { collection: T }): Promise<
    CollectionRecord<T>
  > {
    return await this.pb.collection(collection).getOne(id, {
      expand,
      fields,
    })
  }

  /**
   * Create new record
   */
  async create<T extends Collections = Collections>({
    collection,
    data,
    expand,
    fields,
  }: Omit<CreateParams, 'collection' | 'data'> & {
    collection: T
    data: CollectionCreateData<T>
  }): Promise<CollectionRecord<T>> {
    return await this.pb.collection(collection).create(data, {
      expand,
      fields,
    })
  }

  /**
   * Update existing record
   */
  async update<T extends Collections = Collections>({
    collection,
    id,
    data,
    expand,
    fields,
  }: Omit<UpdateParams, 'collection' | 'data'> & {
    collection: T
    data: CollectionUpdateData<T>
  }): Promise<CollectionRecord<T>> {
    return await this.pb.collection(collection).update(id, data, {
      expand,
      fields,
    })
  }

  /**
   * Delete record
   */
  async delete({ collection, id }: DeleteParams): Promise<null> {
    await this.pb.collection(collection).delete(id)
    return null
  }
}
