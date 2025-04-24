'use client'

import { ArrowRight, ChevronLeft, Server } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import React, { useEffect, useId, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { cloudProvidersList } from '@/lib/integrationList'
import { SecurityGroup, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import AttachCustomServerForm from './AttachCustomServerForm'
import CreateEC2InstanceForm from './CreateEC2InstanceForm'

interface ServerSelectionFormProps {
  setType: (type: string) => void
  type: string
}

interface ServerFormContentProps {
  type: string
  sshKeys: SshKey[]
  securityGroups?: SecurityGroup[]
  server?: ServerType
  formType?: 'create' | 'update'
  onBack: () => void
}

interface ServerFormProps {
  sshKeys: SshKey[]
  securityGroups?: SecurityGroup[]
  server?: ServerType
  formType?: 'create' | 'update'
}

const ServerSelectionForm: React.FC<ServerSelectionFormProps> = ({
  setType,
  type,
}) => {
  const id = useId()
  const [selectedOption, setSelectedOption] = useState<string>('manual')

  const handleContinue = () => {
    setType(selectedOption)
  }

  return (
    <div className='space-y-8'>
      <div className='space-y-6'>
        <div>
          <h3 className='mb-4 text-lg font-medium'>Cloud Providers</h3>
          <RadioGroup
            className='grid grid-cols-1 gap-4 md:grid-cols-2'
            value={selectedOption}
            onValueChange={setSelectedOption}>
            {cloudProvidersList.map(provider => {
              const { label, Icon, live, slug } = provider

              return (
                <div
                  key={slug}
                  className={`has-data-[state=checked]:border-primary/50 shadow-xs relative flex w-full items-start rounded-md border border-input p-6 outline-none ${!live ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                  <RadioGroupItem
                    value={slug}
                    id={`${id}-${slug}`}
                    disabled={!live}
                    className='order-1 after:absolute after:inset-0'
                  />
                  <div className='flex grow items-center gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-secondary'>
                      {Icon && <Icon className='h-6 w-6' />}
                    </div>
                    <div>
                      <Label
                        htmlFor={`${id}-${slug}`}
                        className='text-lg font-medium'>
                        {label}
                      </Label>
                      {!live && (
                        <Badge variant='outline' className='mt-1'>
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </div>
        <Separator />
        <div>
          <h3 className='mb-4 text-lg font-medium'>Manual Configuration</h3>
          <RadioGroup
            className='grid grid-cols-1'
            value={selectedOption}
            onValueChange={setSelectedOption}>
            <div className='has-data-[state=checked]:border-primary/50 shadow-xs relative flex w-full cursor-pointer items-start rounded-md border border-input p-6 outline-none'>
              <RadioGroupItem
                value='manual'
                id={`${id}-manual`}
                className='order-1 after:absolute after:inset-0'
              />
              <div className='flex grow items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-secondary'>
                  <Server className='h-6 w-6' />
                </div>
                <div>
                  <Label
                    htmlFor={`${id}-manual`}
                    className='text-lg font-medium'>
                    Manual Setup
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Bring your own server details
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
      <Button
        className='w-full'
        disabled={!selectedOption}
        onClick={handleContinue}>
        {selectedOption === 'manual'
          ? 'Continue with Manual Setup'
          : `Continue with ${cloudProvidersList.find(p => p.slug === selectedOption)?.label || 'Selected Provider'}`}
        <ArrowRight className='ml-2 h-4 w-4' />
      </Button>
    </div>
  )
}

const ServerFormContent: React.FC<ServerFormContentProps> = ({
  type,
  sshKeys,
  securityGroups,
  server,
  formType,
  onBack,
}) => {
  if (!type) return null

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Button variant='ghost' size='icon' onClick={onBack}>
          <ChevronLeft className='h-5 w-5' />
        </Button>
        <h2 className='text-2xl font-semibold'>
          {type === 'manual'
            ? 'Manual Server Configuration'
            : `Configure ${cloudProvidersList.find(p => p.slug === type)?.label} Server`}
        </h2>
      </div>
      <Separator />
      {type === 'aws' ? (
        <CreateEC2InstanceForm
          sshKeys={sshKeys}
          securityGroups={securityGroups}
          formType={formType}
        />
      ) : (
        <AttachCustomServerForm
          sshKeys={sshKeys}
          server={server}
          formType={formType}
        />
      )}
    </div>
  )
}

const ServerForm: React.FC<ServerFormProps> = ({
  sshKeys,
  securityGroups,
  server,
  formType,
}) => {
  const [type, setType] = useQueryState('type', parseAsString.withDefault(''))

  useEffect(() => {
    return () => {
      setType('')
    }
  }, [])

  const handleResetType = () => {
    setType('')
  }

  return (
    <div className='mx-auto'>
      {!type ? (
        <ServerSelectionForm setType={setType} type={type} />
      ) : (
        <ServerFormContent
          type={type}
          sshKeys={sshKeys}
          securityGroups={securityGroups}
          server={server}
          formType={formType}
          onBack={handleResetType}
        />
      )}
    </div>
  )
}

export default ServerForm
