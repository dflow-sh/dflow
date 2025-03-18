import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

const steps = [
  {
    step: 1,
    title: 'SSH Key Generation',
    description: 'Generate and add SSH keys.',
  },
  {
    step: 2,
    title: 'Add Server',
    description: 'Connect and register your server.',
  },
  {
    step: 3,
    title: 'Configure Domain',
    description: 'Set up your domain name.',
  },
]

export default function StepperComponent() {
  return (
    <div className='mb-5 space-y-6 text-center'>
      <p
        className='text-xs text-muted-foreground'
        role='region'
        aria-live='polite'>
        Onboarding Process
      </p>
      <Stepper defaultValue={2}>
        {steps.map(({ step, title, description }) => (
          <StepperItem
            key={step}
            step={step}
            className='not-last:flex-1 max-md:items-start'>
            <StepperTrigger className='rounded max-md:flex-col'>
              <StepperIndicator />
              <div className='text-center md:text-left'>
                <StepperTitle>{title}</StepperTitle>
                <StepperDescription className='max-sm:hidden'>
                  {description}
                </StepperDescription>
              </div>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className='max-md:mt-3.5 md:mx-4' />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  )
}
