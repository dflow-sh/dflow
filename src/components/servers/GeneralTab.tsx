'use client'

import Tabs from '../Tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// nixpacks, dockerFile, herokuBuildPacks, buildPacks

const options = [
  {
    label: 'Nixpacks',
    value: 'nixpacks',
  },
  {
    label: 'Dockerfile',
    value: 'dockerFile',
  },
  {
    label: 'Heroku Build Packs',
    value: 'herokuBuildPacks',
  },
  {
    label: 'Build Packs',
    value: 'buildPacks',
  },
]

const accounts = [
  {
    label: 'Default Account',
    value: '12345',
  },
]

const GeneralTab = () => {
  return (
    <div className='space-y-4'>
      <div className='space-y-4 rounded border p-4'>
        <div>
          <h3 className='text-lg font-semibold'>Provider</h3>
          <p className='text-muted-foreground'>
            Select the source of your code
          </p>
        </div>

        <Tabs
          tabs={[
            {
              label: 'Github',
              content: () => (
                <div className='space-y-4'>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a account' />
                    </SelectTrigger>

                    <SelectContent>
                      {accounts.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a repository' />
                    </SelectTrigger>

                    <SelectContent>
                      {accounts.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className='grid grid-cols-2 gap-4'>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a branch' />
                      </SelectTrigger>

                      <SelectContent>
                        {accounts.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input placeholder='build path: /' />
                  </div>
                </div>
              ),
            },
            {
              label: 'Gitlab',
            },
            {
              label: 'Bitbucket',
            },
          ]}
        />

        <div className='flex w-full justify-end'>
          <Button>Save</Button>
        </div>
      </div>

      <div className='space-y-4 rounded border p-4'>
        <div>
          <h3 className='text-lg font-semibold'>Built Type</h3>
          <p className='text-muted-foreground'>
            Select a type for building your code
          </p>
        </div>

        <RadioGroup className=''>
          {options.map(({ label, value }) => (
            <div className='flex items-center space-x-2' key={value}>
              <RadioGroupItem value={value} id={label} />
              <Label htmlFor={label}>{label}</Label>
            </div>
          ))}
        </RadioGroup>

        <div className='flex w-full justify-end'>
          <Button>Save</Button>
        </div>
      </div>
    </div>
  )
}

export default GeneralTab
