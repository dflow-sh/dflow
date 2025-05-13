'use client'

import { Skeleton } from '../ui/skeleton'
import { z } from 'zod'

const loginSchema = z.object({
  rootPassword: z
    .number()
    .nullable()
    .refine(val => val !== null, {
      message: 'Root password is required',
    }),
  sshKeys: z.array(z.number()).optional(),
})

const vpsSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Display name is required' })
    .max(255, { message: 'Display name must be 255 characters or less' }),
  pricing: z.object({
    id: z.string().min(1, { message: 'Pricing plan is required' }),
    priceId: z.string().min(1, { message: 'priceId is required' }),
  }),
  region: z.object({
    name: z.string().min(1, { message: 'Region is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  storageType: z.object({
    productId: z.string().min(1, { message: 'Storage type is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  image: z.object({
    imageId: z.string().min(1, { message: 'Image is required' }),
    versionId: z.string().min(1, { message: 'Image version is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  login: loginSchema,
  card: z.string().optional(),
  backup: z.object({
    id: z.string().min(1, { message: 'Backup option is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
})

type VpsFormData = z.infer<typeof vpsSchema>

const VpsFormSkeleton = () => {
  return (
    <section className='flex flex-col'>
      <div>
        <span className='bg-gradient-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text text-lg font-bold text-transparent md:text-2xl'>
          VPS Configuration
        </span>
      </div>

      <div className='mt-5'>
        <Skeleton className='h-8 w-36' />

        {/* VPS Specs */}
        <div className='mt-4'>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-24 w-full' />
            <div className='col-span-1 sm:col-span-2 lg:col-span-4'>
              <Skeleton className='h-24 w-full' />
            </div>
          </div>
        </div>

        <form className='mt-6 flex flex-col gap-y-5'>
          {/* Display Name */}
          <div>
            <label
              className='mb-1 block text-sm font-medium text-slate-300'
              htmlFor='displayName'>
              Display Name <span className='text-cq-danger'>*</span>
            </label>
            <Skeleton className='h-10 w-full' />
          </div>

          {/* Select Term Length */}
          <div>
            <div className='mb-1 flex items-center justify-between'>
              <label
                className='block text-sm font-medium text-slate-300'
                htmlFor='termLength'>
                Term Length <span className='text-cq-danger'>*</span>
              </label>
            </div>

            <div className='flex gap-x-4'>
              <Skeleton className='h-24 w-full' />

              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
            </div>
          </div>

          {/* Select Region */}
          <div>
            <label
              className='mb-1 block text-sm font-medium text-slate-300'
              htmlFor='region'>
              Region <span className='text-cq-danger'>*</span>
            </label>
            <Skeleton className='h-10 w-full' />
          </div>

          {/* Select Storage Type */}
          <div>
            <label
              className='mb-1 block text-sm font-medium text-slate-300'
              htmlFor='storageType'>
              Storage Type <span className='text-cq-danger'>*</span>
            </label>
            <Skeleton className='h-10 w-full' />
          </div>

          {/* Select Image */}
          <div>
            <div className='mb-1 flex items-center justify-between'>
              <label className='block text-sm font-medium text-slate-300'>
                Image <span className='text-cq-danger'>*</span>
              </label>
            </div>

            <div className='flex gap-x-4'>
              <Skeleton className='h-24 w-full' />

              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-24 w-full' />
            </div>
            {/* Select version for the selected OS */}
            <div className='mt-4'>
              <label
                className='mb-1 block text-sm font-medium text-slate-300'
                htmlFor='image-version'>
                Version <span className='text-cq-danger'>*</span>
              </label>

              <div className='flex gap-x-4'>
                <Skeleton className='h-24 w-full' />

                <Skeleton className='h-24 w-full' />
                <Skeleton className='h-24 w-full' />
              </div>
            </div>
          </div>

          {/* Server Login Details */}
          <div>
            <div className='mb-1 flex items-center justify-between'>
              <label className='mb-1 block text-sm font-medium text-slate-300'>
                Server Login Details <span className='text-cq-danger'>*</span>
              </label>
              <Skeleton className='h-10 w-24' />
            </div>

            <div className='mt-2'>
              <div>
                <label
                  className='mb-1 block text-sm font-medium text-slate-300'
                  htmlFor='defaultUser'>
                  Username <span className='text-cq-danger'>*</span>
                </label>
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='mt-1'>
                <label
                  className='mb-1 block text-sm font-medium text-slate-300'
                  htmlFor='rootPassword'>
                  Password <span className='text-cq-danger'>*</span>
                </label>
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='mt-1'>
                <label
                  className='mb-1 block text-sm font-medium text-slate-300'
                  htmlFor='sshKeys'>
                  SSH Keys
                </label>

                <Skeleton className='h-10 w-full' />
              </div>
            </div>
          </div>

          {/* Backup Options */}

          <div className='mt-4'>
            <label className='mb-1 block text-sm font-medium text-slate-300'>
              Data Protection with Auto Backup{' '}
              <span className='text-cq-danger'>*</span>
            </label>

            <div className='flex gap-x-4'>
              <Skeleton className='h-36 w-full' />
              <Skeleton className='h-36 w-full' />
            </div>
          </div>

          {/* Price Summary Section - Add this before the Submit & Cancel Button div */}
          <div className='mt-6 shadow-lg'>
            <h3 className='text-cq-text mb-4 text-lg font-semibold'>
              Price Summary
            </h3>

            <Skeleton className='h-36 w-full' />
          </div>

          {/* Submit & Cancel Button */}
          <div className='mt-5 flex w-full items-center justify-end space-x-4'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-24' />
          </div>
        </form>
      </div>
    </section>
  )
}

export default VpsFormSkeleton
