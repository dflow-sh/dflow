'use client'

import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'

import { createAppGithubAction } from '@/actions/createAppGithub'
import CreateProject from '@/components/CreateProject'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

const DashboardPage = () => {
  const [appName, setAppName] = useState('')
  const [githubUsername, setGithubUsername] = useState('tonykhbo')
  const [projectName, setProjectName] = useState('hello-world-nextjs')
  const [branchName, setBranchName] = useState('main')

  const { toast } = useToast()

  const { execute: CreateAppGithubAction } = useAction(createAppGithubAction, {
    onSuccess: ({ data }) => {
      console.log({ data })
      setAppName('')
      setGithubUsername('')
      setProjectName('')
      setBranchName('main')
      toast({
        title: 'Successful',
        description: 'Successfully created app',
      })
    },
    onError: ({ error }) => {
      toast({
        title: 'Failed to create database',
        description: 'An unknown error occurred',
      })
    },
  })

  return (
    <section className='space-y-6'>
      <CreateProject />

      <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {[1, 2, 3].map(index => (
          <ProjectCard key={index} />
        ))}
      </div>
      <div className='flex gap-4'>
        <Input
          placeholder='enter the name of the app'
          onChange={e => {
            setAppName(e.target.value)
          }}
          value={appName}
        />
        <Input
          placeholder='github username'
          onChange={e => {
            setGithubUsername(e.target.value)
          }}
          value={githubUsername}
        />
        <Input
          placeholder='project name'
          onChange={e => {
            setProjectName(e.target.value)
          }}
          value={projectName}
        />
        <Input
          placeholder='branch name'
          onChange={e => {
            setBranchName(e.target.value)
          }}
          value={branchName}
        />

        <Button
          onClick={() => {
            CreateAppGithubAction({
              appName,
              userName: githubUsername,
              repoName: projectName,
              branch: branchName,
            })
          }}>
          Create App
        </Button>
      </div>
    </section>
  )
}

export default DashboardPage
