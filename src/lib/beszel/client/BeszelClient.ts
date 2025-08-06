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

// Custom error classes for better error handling
export class BeszelAuthError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message)
    this.name = 'BeszelAuthError'
  }
}

export class BeszelConnectionError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message)
    this.name = 'BeszelConnectionError'
  }
}

export class BeszelValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message)
    this.name = 'BeszelValidationError'
  }
}

// Authentication options interface
export interface AuthOptions {
  email: string
  password: string
  superuser?: boolean
}

// Client configuration interface
export interface ClientConfig {
  url: string
  auth?: AuthOptions
  autoReconnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
  requestTimeout?: number
}

// User information interface
export interface UserInfo {
  id: string
  email: string
  name?: string
  avatar?: string
  verified?: boolean
  collectionName: string
  isSuperuser: boolean
}

// Explicit login helpers with enhanced error handling
export async function loginAsBeszelUser(
  url: string,
  email: string,
  password: string,
): Promise<PocketBase> {
  try {
    const pb = new PocketBase(url)
    await pb.collection('users').authWithPassword(email, password)
    return pb
  } catch (error) {
    throw new BeszelAuthError(
      `Failed to login as user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined,
    )
  }
}

export async function loginAsBeszelSuperuser(
  url: string,
  email: string,
  password: string,
): Promise<PocketBase> {
  try {
    const pb = new PocketBase(url)
    await pb.collection('_superusers').authWithPassword(email, password)
    return pb
  } catch (error) {
    throw new BeszelAuthError(
      `Failed to login as superuser: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined,
    )
  }
}

export class BeszelClient {
  private pb: PocketBase
  private config: ClientConfig
  private reconnectAttempts = 0

  constructor(
    monitoringUrlOrPbOrConfig: string | PocketBase | ClientConfig,
    opts?: { email?: string; password?: string; superuser?: boolean },
  ) {
    if (typeof monitoringUrlOrPbOrConfig === 'string') {
      // Legacy constructor support
      this.config = {
        url: monitoringUrlOrPbOrConfig,
        auth:
          opts?.email && opts?.password
            ? {
                email: opts.email,
                password: opts.password,
                superuser: opts.superuser,
              }
            : undefined,
        autoReconnect: true,
        reconnectAttempts: 3,
        reconnectDelay: 1000,
        requestTimeout: 30000,
      }
      this.pb = new PocketBase(monitoringUrlOrPbOrConfig)

      // Auto-login if credentials are provided
      if (opts?.email && opts?.password) {
        this.performAutoLogin(opts.email, opts.password, opts.superuser)
      }
    } else if (monitoringUrlOrPbOrConfig instanceof PocketBase) {
      // PocketBase instance provided
      this.pb = monitoringUrlOrPbOrConfig
      this.config = {
        url: this.pb.baseUrl,
        autoReconnect: true,
        reconnectAttempts: 3,
        reconnectDelay: 1000,
        requestTimeout: 30000,
      }
    } else {
      // ClientConfig provided
      this.config = {
        autoReconnect: true,
        reconnectAttempts: 3,
        reconnectDelay: 1000,
        requestTimeout: 30000,
        ...monitoringUrlOrPbOrConfig,
      }
      this.pb = new PocketBase(this.config.url)

      // Auto-login if credentials are provided in config
      if (this.config.auth) {
        this.performAutoLogin(
          this.config.auth.email,
          this.config.auth.password,
          this.config.auth.superuser,
        )
      }
    }

    // Set up auth store change listener for auto-reconnect
    this.pb.authStore.onChange(() => {
      if (
        !this.pb.authStore.isValid &&
        this.config.autoReconnect &&
        this.config.auth
      ) {
        this.handleReconnection()
      }
    })
  }

  private async performAutoLogin(
    email: string,
    password: string,
    superuser?: boolean,
  ): Promise<void> {
    try {
      const loginPromise = superuser
        ? this.pb.collection('_superusers').authWithPassword(email, password)
        : this.pb.collection('users').authWithPassword(email, password)

      await loginPromise
      this.reconnectAttempts = 0 // Reset on successful login
    } catch (error) {
      console.error('Auto-login failed:', error)
      throw new BeszelAuthError(
        'Auto-login failed',
        error instanceof Error ? error : undefined,
      )
    }
  }

  private async handleReconnection(): Promise<void> {
    if (
      !this.config.auth ||
      this.reconnectAttempts >= (this.config.reconnectAttempts || 3)
    ) {
      return
    }

    this.reconnectAttempts++

    try {
      await new Promise(resolve =>
        setTimeout(resolve, this.config.reconnectDelay || 1000),
      )
      await this.performAutoLogin(
        this.config.auth.email,
        this.config.auth.password,
        this.config.auth.superuser,
      )
      console.log('Successfully reconnected to Beszel')
    } catch (error) {
      console.error(
        `Reconnection attempt ${this.reconnectAttempts} failed:`,
        error,
      )
      if (this.reconnectAttempts < (this.config.reconnectAttempts || 3)) {
        this.handleReconnection() // Try again
      }
    }
  }

  /**
   * Static factory method to create a client with guaranteed superuser authentication
   */
  static async createWithSuperuserAuth(
    url: string,
    email: string,
    password: string,
    options?: Partial<ClientConfig>,
  ): Promise<BeszelClient> {
    const pb = await loginAsBeszelSuperuser(url, email, password)
    const config: ClientConfig = {
      url,
      auth: { email, password, superuser: true },
      ...options,
    }
    return new BeszelClient(pb)
  }

  /**
   * Static factory method to create a client with guaranteed user authentication
   */
  static async createWithUserAuth(
    url: string,
    email: string,
    password: string,
    options?: Partial<ClientConfig>,
  ): Promise<BeszelClient> {
    const pb = await loginAsBeszelUser(url, email, password)
    const config: ClientConfig = {
      url,
      auth: { email, password, superuser: false },
      ...options,
    }
    return new BeszelClient(pb)
  }

  /**
   * Static factory method to create a client with configuration
   */
  static async createWithConfig(config: ClientConfig): Promise<BeszelClient> {
    const client = new BeszelClient(config)
    if (config.auth) {
      await client.performAutoLogin(
        config.auth.email,
        config.auth.password,
        config.auth.superuser,
      )
    }
    return client
  }

  /**
   * Test connection to the server
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.pb.health.check()
      return true
    } catch (error) {
      throw new BeszelConnectionError(
        'Failed to connect to server',
        error instanceof Error ? error : undefined,
      )
    }
  }

  /**
   * Login with credentials
   */
  async login(
    email: string,
    password: string,
    superuser = false,
  ): Promise<UserInfo> {
    try {
      const authData = superuser
        ? await this.pb
            .collection('_superusers')
            .authWithPassword(email, password)
        : await this.pb.collection('users').authWithPassword(email, password)

      // Update config with successful auth
      this.config.auth = { email, password, superuser }
      this.reconnectAttempts = 0

      return this.getCurrentUser()!
    } catch (error) {
      throw new BeszelAuthError(
        `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined,
      )
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid
  }

  /**
   * Get the currently logged-in user model with enhanced information
   */
  getCurrentUser(): UserInfo | null {
    const model = this.pb.authStore.model
    if (!model) return null

    return {
      id: model.id,
      email: model.email,
      name: model.name,
      avatar: model.avatar,
      verified: model.verified,
      collectionName: model.collectionName || 'users',
      isSuperuser: model.collectionName === '_superusers',
    }
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
    this.config.auth = undefined
    this.reconnectAttempts = 0
  }

  /**
   * Get server health status
   */
  async getHealthStatus(): Promise<{
    code: number
    message: string
    data: any
  }> {
    try {
      return await this.pb.health.check()
    } catch (error) {
      throw new BeszelConnectionError(
        'Failed to get server health status',
        error instanceof Error ? error : undefined,
      )
    }
  }

  /**
   * Get paginated list of records with enhanced error handling
   */
  async getList<T extends Collections = Collections>({
    collection,
    page = 1,
    perPage = 30,
    sort,
    filter = '',
    expand,
    fields,
    skipTotal = false,
  }: Omit<ListParams, 'collection'> & { collection: T }): Promise<
    PocketBaseListResult<CollectionRecord<T>>
  > {
    try {
      this.validateCollection(collection)
      this.validatePagination(page, perPage)

      return await this.pb.collection(collection).getList(page, perPage, {
        filter,
        sort,
        expand,
        fields,
        skipTotal,
      })
    } catch (error) {
      this.handleApiError(error, 'getList')
      throw error // Re-throw after handling
    }
  }

  /**
   * Get all records at once with enhanced error handling
   */
  async getFullList<T extends Collections = Collections>({
    collection,
    sort,
    filter = '',
    expand,
    fields,
    batch = 500, // Add batch size parameter for large datasets
  }: Omit<FullListParams, 'collection'> & {
    collection: T
    batch?: number
  }): Promise<CollectionRecord<T>[]> {
    try {
      this.validateCollection(collection)

      return await this.pb.collection(collection).getFullList({
        filter,
        sort,
        expand,
        fields,
        batch,
      })
    } catch (error) {
      this.handleApiError(error, 'getFullList')
      throw error
    }
  }

  /**
   * Get first record that matches filter with enhanced error handling
   */
  async getFirstListItem<T extends Collections = Collections>({
    collection,
    filter,
    expand,
    fields,
  }: Omit<FirstListItemParams, 'collection'> & { collection: T }): Promise<
    CollectionRecord<T>
  > {
    try {
      this.validateCollection(collection)

      if (!filter || filter.trim() === '') {
        throw new BeszelValidationError(
          'Filter is required for getFirstListItem',
        )
      }

      return await this.pb.collection(collection).getFirstListItem(filter, {
        expand,
        fields,
      })
    } catch (error) {
      this.handleApiError(error, 'getFirstListItem')
      throw error
    }
  }

  /**
   * Get single record by ID with enhanced error handling
   */
  async getOne<T extends Collections = Collections>({
    collection,
    id,
    expand,
    fields,
  }: Omit<GetOneParams, 'collection'> & { collection: T }): Promise<
    CollectionRecord<T>
  > {
    try {
      this.validateCollection(collection)
      this.validateId(id)

      return await this.pb.collection(collection).getOne(id, {
        expand,
        fields,
      })
    } catch (error) {
      this.handleApiError(error, 'getOne')
      throw error
    }
  }

  /**
   * Create new record with enhanced validation and error handling
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
    try {
      this.validateCollection(collection)
      this.validateCreateData(data)

      return await this.pb.collection(collection).create(data, {
        expand,
        fields,
      })
    } catch (error) {
      this.handleApiError(error, 'create')
      throw error
    }
  }

  /**
   * Update existing record with enhanced validation and error handling
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
    try {
      this.validateCollection(collection)
      this.validateId(id)
      this.validateUpdateData(data)

      return await this.pb.collection(collection).update(id, data, {
        expand,
        fields,
      })
    } catch (error) {
      this.handleApiError(error, 'update')
      throw error
    }
  }

  /**
   * Delete record with enhanced error handling
   */
  async delete({ collection, id }: DeleteParams): Promise<boolean> {
    try {
      this.validateCollection(collection)
      this.validateId(id)

      await this.pb.collection(collection).delete(id)
      return true
    } catch (error) {
      this.handleApiError(error, 'delete')
      return false
    }
  }

  /**
   * Batch operations for better performance
   */
  async batchCreate<T extends Collections = Collections>(
    collection: T,
    records: CollectionCreateData<T>[],
  ): Promise<CollectionRecord<T>[]> {
    this.validateCollection(collection)

    if (!records || records.length === 0) {
      throw new BeszelValidationError('No records provided for batch create')
    }

    const results: CollectionRecord<T>[] = []
    const errors: Error[] = []

    for (const data of records) {
      try {
        const result = await this.create({ collection, data })
        results.push(result)
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error('Unknown error'))
      }
    }

    if (errors.length > 0 && errors.length === records.length) {
      throw new Error(
        `All batch operations failed. First error: ${errors[0].message}`,
      )
    }

    return results
  }

  /**
   * Subscribe to real-time changes (if supported by PocketBase)
   */
  async subscribe<T extends Collections = Collections>(
    collection: T,
    callback: (data: { action: string; record: CollectionRecord<T> }) => void,
    filter?: string,
  ): Promise<() => void> {
    try {
      this.validateCollection(collection)

      return await this.pb.collection(collection).subscribe('*', callback, {
        filter,
      })
    } catch (error) {
      this.handleApiError(error, 'subscribe')
      throw error
    }
  }

  /**
   * Get client configuration
   */
  getConfig(): Readonly<ClientConfig> {
    return { ...this.config }
  }

  /**
   * Update client configuration
   */
  updateConfig(newConfig: Partial<ClientConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get raw PocketBase instance (for advanced usage)
   */
  getRawClient(): PocketBase {
    return this.pb
  }

  // Private validation methods
  private validateCollection(collection: string): void {
    if (!collection || collection.trim() === '') {
      throw new BeszelValidationError('Collection name is required')
    }
  }

  private validateId(id: string): void {
    if (!id || id.trim() === '') {
      throw new BeszelValidationError('Record ID is required')
    }
  }

  private validatePagination(page: number, perPage: number): void {
    if (page < 1) {
      throw new BeszelValidationError('Page must be greater than 0')
    }
    if (perPage < 1 || perPage > 500) {
      throw new BeszelValidationError('PerPage must be between 1 and 500')
    }
  }

  private validateCreateData(data: any): void {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      throw new BeszelValidationError('Create data cannot be empty')
    }
  }

  private validateUpdateData(data: any): void {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      throw new BeszelValidationError('Update data cannot be empty')
    }
  }

  private handleApiError(error: any, operation: string): void {
    console.error(`BeszelClient.${operation} error:`, error)

    // You can add more specific error handling here based on error types
    if (error?.status === 401) {
      console.warn('Authentication expired, attempting to reconnect...')
      if (this.config.autoReconnect && this.config.auth) {
        this.handleReconnection()
      }
    }
  }
}
