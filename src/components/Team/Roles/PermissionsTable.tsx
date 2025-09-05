import { UseFormReturn, useWatch } from 'react-hook-form'

import { PermissionsTableType } from '@/actions/roles/validator'
import { Checkbox } from '@/components/ui/check-box'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PermissionsTable = ({
  form,
}: {
  form: UseFormReturn<PermissionsTableType>
}) => {
  const { servers, projects } = useWatch({ control: form.control })
  return (
    <Table className='w-full'>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[240px]'>Collection</TableHead>
          <TableHead>Create</TableHead>
          <TableHead>Read</TableHead>
          <TableHead>Update</TableHead>
          <TableHead>Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className='text-md font-semibold'>Projects</TableCell>
          <TableCell>
            <div className='flex items-center gap-x-2'>
              <FormField
                control={form.control}
                name='projects.create'
                render={({ field }) => (
                  <FormItem className='space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={checked => {
                          field.onChange(checked)
                          form.setValue('projects.createLimit', 0)
                        }}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {projects?.create && (
                <FormField
                  control={form.control}
                  name='projects.createLimit'
                  render={({ field }) => (
                    <FormItem className='space-y-0'>
                      <FormControl>
                        <Input
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
                name='projects.read'
                render={({ field }) => (
                  <FormItem className='space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={checked => {
                          field.onChange(checked)
                          form.setValue('projects.readLimit', 'all')
                        }}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {projects?.read && (
                <FormField
                  control={form.control}
                  name='projects.readLimit'
                  render={({ field }) => (
                    <FormItem className='space-y-0'>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || 'all'}>
                          <FormControl>
                            <SelectTrigger className='w-[180px]'>
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
              name='projects.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='projects.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>Servers</TableCell>
          <TableCell>
            <div className='flex items-center gap-x-2'>
              <FormField
                control={form.control}
                name='servers.create'
                render={({ field }) => (
                  <FormItem className='space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={checked => {
                          field.onChange(checked)
                          form.setValue('servers.createLimit', 0)
                        }}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {servers?.create && (
                <FormField
                  control={form.control}
                  name='servers.createLimit'
                  render={({ field }) => (
                    <FormItem className='space-y-0'>
                      <FormControl>
                        <Input
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
                name='servers.read'
                render={({ field }) => (
                  <FormItem className='space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={checked => {
                          field.onChange(checked)
                          form.setValue('servers.readLimit', 'all')
                        }}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {servers?.read && (
                <FormField
                  control={form.control}
                  name='servers.readLimit'
                  render={({ field }) => (
                    <FormItem className='space-y-0'>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || 'all'}>
                          <FormControl>
                            <SelectTrigger className='w-[180px]'>
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
              name='servers.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='servers.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>Services</TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='services.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='services.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='services.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='services.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>Templates</TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='templates.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='templates.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='templates.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='templates.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>Roles</TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='roles.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='roles.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='roles.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='roles.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>Backups</TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='backups.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='backups.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='backups.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='backups.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>
            Security Groups
          </TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='securityGroups.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='securityGroups.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='securityGroups.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='securityGroups.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>SSH Keys</TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='sshKeys.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='sshKeys.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='sshKeys.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='sshKeys.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>
            Cloud Provider Accounts
          </TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='cloudProviderAccounts.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='cloudProviderAccounts.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='cloudProviderAccounts.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='cloudProviderAccounts.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>
            Docker Registries
          </TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='dockerRegistries.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='dockerRegistries.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='dockerRegistries.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='dockerRegistries.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>Git Providers</TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='gitProviders.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='gitProviders.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='gitProviders.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='gitProviders.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='text-md font-semibold'>Team</TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name='team.create'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='team.read'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='team.update'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              name='team.delete'
              render={({ field }) => (
                <FormItem className='space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default PermissionsTable
