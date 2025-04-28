import { Dices } from 'lucide-react'
import {
  Config,
  NumberDictionary,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { Textarea } from '@/components/ui/textarea'
import { CloudProviderAccount } from '@/payload-types'

export const handleGenerateName = (): string => {
  const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 })

  const nameConfig: Config = {
    dictionaries: [['dFlow'], adjectives, animals, numberDictionary],
    separator: '-',
    length: 4,
    style: 'lowerCase',
  }

  return uniqueNamesGenerator(nameConfig)
}

const BasicInfoSection = ({
  form,
  filteredAccounts,
}: {
  form: any
  filteredAccounts: CloudProviderAccount[]
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Security Group Name</FormLabel>
            <div className='flex w-full items-center space-x-2'>
              <FormControl>
                <Input {...field} className='w-full' />
              </FormControl>
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => {
                  const generatedName = handleGenerateName()
                  form.setValue('name', generatedName)
                }}
                title='Generate unique name'>
                <Dices className='h-4 w-4' />
              </Button>
            </div>
            <FormDescription>
              Avoid using this security group name in your cloud account, as it
              may cause sync errors and server creation failure.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='cloudProvider'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cloud Provider</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select cloud provider' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='aws'>AWS</SelectItem>
                  <SelectItem value='azure'>Azure</SelectItem>
                  <SelectItem value='gcp'>Google Cloud Platform</SelectItem>
                  <SelectItem value='digitalocean'>Digital Ocean</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='cloudProviderAccount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cloud Provider Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select an account' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}

export default BasicInfoSection
