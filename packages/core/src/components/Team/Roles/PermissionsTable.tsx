import { UseFormReturn } from 'react-hook-form'

import { CreateRoleType } from '@dflow/core/actions/roles/validator'
import { Checkbox } from '@dflow/core/components/ui/check-box'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@dflow/core/components/ui/form'
import { Input } from '@dflow/core/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dflow/core/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@dflow/core/components/ui/table'

type Collections =
  | 'projects'
  | 'services'
  | 'servers'
  | 'templates'
  | 'roles'
  | 'backups'
  | 'securityGroups'
  | 'sshKeys'
  | 'cloudProviderAccounts'
  | 'dockerRegistries'
  | 'gitProviders'
  | 'team'

const PermissionsTable = ({
  form,
  isAdminRole,
}: {
  form: UseFormReturn<CreateRoleType>
  isAdminRole?: boolean | null
}) => {
  const collections: Collections[] = [
    'projects',
    'services',
    'servers',
    'templates',
    'roles',
    'backups',
    'securityGroups',
    'sshKeys',
    'cloudProviderAccounts',
    'dockerRegistries',
    'gitProviders',
    'team',
  ]
  const setAllPermissionsForCollection = (
    collection: Collections,
    checked: boolean,
  ) => {
    form.setValue(`${collection}.create`, checked, {
      shouldValidate: true,
      shouldDirty: true,
    })
    form.setValue(`${collection}.read`, checked, {
      shouldValidate: true,
      shouldDirty: true,
    })
    form.setValue(`${collection}.update`, checked, {
      shouldValidate: true,
      shouldDirty: true,
    })
    form.setValue(`${collection}.delete`, checked, {
      shouldValidate: true,
      shouldDirty: true,
    })

    if ((collection === 'projects' || collection === 'servers') && !checked) {
      form.setValue(`${collection}.createLimit`, 0, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue(`${collection}.readLimit`, 'all', {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  const selectAllPermissions = (checked: boolean) => {
    collections.forEach(collection => {
      form.setValue(`${collection}.create`, checked, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue(`${collection}.read`, checked, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue(`${collection}.update`, checked, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue(`${collection}.delete`, checked, {
        shouldValidate: true,
        shouldDirty: true,
      })
      if ((collection === 'projects' || collection === 'servers') && !checked) {
        form.setValue(`${collection}.createLimit`, 0, {
          shouldValidate: true,
          shouldDirty: true,
        })
        form.setValue(`${collection}.readLimit`, 'all', {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    })
  }

  return (
    <Table className='w-full'>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[40px]'>
            <Checkbox
              disabled={Boolean(isAdminRole)}
              checked={collections.every(
                c =>
                  form.watch(`${c}.create`) &&
                  form.watch(`${c}.read`) &&
                  form.watch(`${c}.update`) &&
                  form.watch(`${c}.delete`),
              )}
              onCheckedChange={checked => selectAllPermissions(!!checked)}
            />
          </TableHead>
          <TableHead className='w-[240px]'>Collection</TableHead>
          <TableHead>Create</TableHead>
          <TableHead>Read</TableHead>
          <TableHead>Update</TableHead>
          <TableHead>Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collections.map(collection => {
          const watched = {
            create: form.watch(`${collection}.create`),
            read: form.watch(`${collection}.read`),
            update: form.watch(`${collection}.update`),
            delete: form.watch(`${collection}.delete`),
          }
          return (
            <TableRow>
              <TableCell>
                <Checkbox
                  disabled={Boolean(isAdminRole)}
                  checked={
                    watched.create &&
                    watched.read &&
                    watched.update &&
                    watched.delete
                  }
                  onCheckedChange={checked =>
                    setAllPermissionsForCollection(collection, !!checked)
                  }
                />
              </TableCell>
              <TableCell className='text-md font-semibold capitalize'>
                {collection}
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-x-2'>
                  <FormField
                    control={form.control}
                    name={`${collection}.create`}
                    render={({ field }) => (
                      <FormItem className='space-y-0'>
                        <FormControl>
                          <Checkbox
                            disabled={Boolean(isAdminRole)}
                            checked={!!field.value}
                            onCheckedChange={checked => {
                              field.onChange(!!checked)
                              // reset limit only if collection supports it
                              if (
                                collection === 'projects' ||
                                collection === 'servers'
                              ) {
                                form.setValue(`${collection}.createLimit`, 0)
                              }
                            }}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(collection === 'projects' || collection === 'servers') &&
                    watched.create && (
                      <FormField
                        control={form.control}
                        name={`${collection}.createLimit`}
                        render={({ field }) => (
                          <FormItem className='space-y-0'>
                            <FormControl>
                              <Input
                                disabled={Boolean(isAdminRole)}
                                className='w-[180px]'
                                type='number'
                                placeholder='0'
                                min={0}
                                max={99}
                                value={field.value?.toString() || '0'}
                                onChange={e => {
                                  const val = e.target.value
                                  if (val === '') {
                                    field.onChange(0)
                                  } else {
                                    const numVal = parseInt(val, 10)
                                    if (!isNaN(numVal) && numVal >= 0) {
                                      field.onChange(numVal)
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-x-2'>
                  <FormField
                    control={form.control}
                    name={`${collection}.read`}
                    render={({ field }) => (
                      <FormItem className='space-y-0'>
                        <FormControl>
                          <Checkbox
                            disabled={Boolean(isAdminRole)}
                            checked={!!field.value}
                            onCheckedChange={checked => {
                              field.onChange(!!checked)
                              // reset limit only if collection supports it
                              if (
                                collection === 'projects' ||
                                collection === 'servers'
                              ) {
                                form.setValue(`${collection}.readLimit`, 'all')
                              }
                            }}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(collection === 'projects' || collection === 'servers') &&
                    watched.read && (
                      <FormField
                        control={form.control}
                        name={`${collection}.readLimit`}
                        render={({ field }) => (
                          <FormItem className='space-y-0'>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value || 'all'}>
                                <FormControl>
                                  <SelectTrigger
                                    disabled={Boolean(isAdminRole)}
                                    className='w-[180px]'>
                                    <SelectValue placeholder='Select' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='all'>All</SelectItem>
                                  <SelectItem value='createdByUser'>
                                    User Specific
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                </div>
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`${collection}.update`}
                  render={({ field }) => (
                    <FormItem className='space-y-0'>
                      <FormControl>
                        <Checkbox
                          disabled={Boolean(isAdminRole)}
                          checked={!!field.value}
                          onCheckedChange={checked => {
                            field.onChange(!!checked)
                          }}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name={`${collection}.delete`}
                  render={({ field }) => (
                    <FormItem className='space-y-0'>
                      <FormControl>
                        <Checkbox
                          disabled={Boolean(isAdminRole)}
                          checked={!!field.value}
                          onCheckedChange={checked => {
                            field.onChange(!!checked)
                          }}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default PermissionsTable
