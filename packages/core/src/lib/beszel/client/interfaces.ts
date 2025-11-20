// Service method parameter interfaces
export interface ListParams {
  collection: string
  page?: number
  perPage?: number
  sort?: string
  filter?: string
  expand?: string
  fields?: string
  skipTotal?: boolean
}

export interface FullListParams {
  collection: string
  sort?: string
  filter?: string
  expand?: string
  fields?: string
}

export interface FirstListItemParams {
  collection: string
  filter: string
  expand?: string
  fields?: string
}

export interface GetOneParams {
  collection: string
  id: string
  expand?: string
  fields?: string
}

export interface CreateParams<T = any> {
  collection: string
  data: T
  expand?: string
  fields?: string
}

export interface UpdateParams<T = any> {
  collection: string
  id: string
  data: T
  expand?: string
  fields?: string
}

export interface DeleteParams {
  collection: string
  id: string
}
