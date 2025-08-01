import {
  Alert,
  Collections,
  CreateAlertData,
  CreateSystemStatsData,
  CreateUserData,
  PocketBaseListResult,
  SystemStats,
  UpdateAlertData,
  UpdateSystemStatsData,
  UpdateUserData,
  User,
} from '../types'

import { BeszelClient } from './BeszelClient'

/**
 * Typed helper functions for better developer experience
 * These provide collection-specific methods with full type safety
 */
export class TypedBeszelHelpers {
  constructor(private client: BeszelClient) {}

  // ========== USERS ==========
  async getUsers(params?: {
    page?: number
    perPage?: number
    sort?: string
    filter?: string
    expand?: string
    fields?: string
    skipTotal?: boolean
  }): Promise<PocketBaseListResult<User>> {
    return this.client.getList({
      collection: Collections.USERS,
      ...params,
    })
  }

  async getAllUsers(params?: {
    sort?: string
    filter?: string
    expand?: string
    fields?: string
  }): Promise<User[]> {
    return this.client.getFullList({
      collection: Collections.USERS,
      ...params,
    })
  }

  async getUser(
    id: string,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<User> {
    return this.client.getOne({
      collection: Collections.USERS,
      id,
      ...params,
    })
  }

  async createUser(
    data: CreateUserData,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<User> {
    return this.client.create({
      collection: Collections.USERS,
      data,
      ...params,
    })
  }

  async updateUser(
    id: string,
    data: UpdateUserData,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<User> {
    return this.client.update({
      collection: Collections.USERS,
      id,
      data,
      ...params,
    })
  }

  async deleteUser(id: string): Promise<null> {
    return this.client.delete({
      collection: Collections.USERS,
      id,
    })
  }

  // ========== ALERTS ==========
  async getAlerts(params?: {
    page?: number
    perPage?: number
    sort?: string
    filter?: string
    expand?: string
    fields?: string
    skipTotal?: boolean
  }): Promise<PocketBaseListResult<Alert>> {
    return this.client.getList({
      collection: Collections.ALERTS,
      ...params,
    })
  }

  async getAllAlerts(params?: {
    sort?: string
    filter?: string
    expand?: string
    fields?: string
  }): Promise<Alert[]> {
    return this.client.getFullList({
      collection: Collections.ALERTS,
      ...params,
    })
  }

  async getAlert(
    id: string,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<Alert> {
    return this.client.getOne({
      collection: Collections.ALERTS,
      id,
      ...params,
    })
  }

  async createAlert(
    data: CreateAlertData,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<Alert> {
    return this.client.create({
      collection: Collections.ALERTS,
      data,
      ...params,
    })
  }

  async updateAlert(
    id: string,
    data: UpdateAlertData,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<Alert> {
    return this.client.update({
      collection: Collections.ALERTS,
      id,
      data,
      ...params,
    })
  }

  async deleteAlert(id: string): Promise<null> {
    return this.client.delete({
      collection: Collections.ALERTS,
      id,
    })
  }

  // ========== SYSTEM STATS ==========
  async getSystemStats(params?: {
    page?: number
    perPage?: number
    sort?: string
    filter?: string
    expand?: string
    fields?: string
    skipTotal?: boolean
  }): Promise<PocketBaseListResult<SystemStats>> {
    return this.client.getList({
      collection: Collections.SYSTEM_STATS,
      ...params,
    })
  }

  async getAllSystemStats(params?: {
    sort?: string
    filter?: string
    expand?: string
    fields?: string
  }): Promise<SystemStats[]> {
    return this.client.getFullList({
      collection: Collections.SYSTEM_STATS,
      ...params,
    })
  }

  async getSystemStat(
    id: string,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<SystemStats> {
    return this.client.getOne({
      collection: Collections.SYSTEM_STATS,
      id,
      ...params,
    })
  }

  async createSystemStat(
    data: CreateSystemStatsData,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<SystemStats> {
    return this.client.create({
      collection: Collections.SYSTEM_STATS,
      data,
      ...params,
    })
  }

  async updateSystemStat(
    id: string,
    data: UpdateSystemStatsData,
    params?: {
      expand?: string
      fields?: string
    },
  ): Promise<SystemStats> {
    return this.client.update({
      collection: Collections.SYSTEM_STATS,
      id,
      data,
      ...params,
    })
  }

  async deleteSystemStat(id: string): Promise<null> {
    return this.client.delete({
      collection: Collections.SYSTEM_STATS,
      id,
    })
  }

  // ========== CONVENIENCE METHODS ==========

  /**
   * Get triggered alerts
   */
  async getTriggeredAlerts(): Promise<Alert[]> {
    return this.getAllAlerts({
      filter: 'triggered=true',
      sort: '-created',
    })
  }

  /**
   * Get recent system stats for a specific system
   */
  async getRecentSystemStats(
    systemId: string,
    limit: number = 10,
  ): Promise<SystemStats[]> {
    const result = await this.getSystemStats({
      filter: `system="${systemId}"`,
      sort: '-created',
      perPage: limit,
      page: 1,
    })
    return result.items
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User> {
    return this.client.getFirstListItem({
      collection: Collections.USERS,
      filter: `email="${email}"`,
    })
  }
}
