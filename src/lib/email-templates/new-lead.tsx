import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  phone?: string
  zip?: string
  service?: string
  source?: string
  submittedAt?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const heading = { fontSize: '20px', color: '#152238', margin: '0 0 4px' }
const sub = { fontSize: '14px', color: '#5b6b7c', margin: '0 0 16px' }
const row = { fontSize: '15px', color: '#152238', margin: '0 0 8px' }
const label = { color: '#5b6b7c' }

const NewLeadEmail = ({ name, phone, zip, service, source, submittedAt }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New lead: ${name ?? 'Unknown'} — ${service ?? 'Service request'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>New lead from PureFlow Air &amp; Chimney</Heading>
        <Text style={sub}>A visitor submitted the website request form.</Text>
        <Hr />
        <Section>
          <Text style={row}><span style={label}>Name: </span>{name ?? '—'}</Text>
          <Text style={row}><span style={label}>Phone: </span>{phone ?? '—'}</Text>
          <Text style={row}><span style={label}>ZIP: </span>{zip ?? '—'}</Text>
          <Text style={row}><span style={label}>Service: </span>{service ?? '—'}</Text>
          <Text style={row}><span style={label}>Form: </span>{source ?? '—'}</Text>
          <Text style={row}><span style={label}>Submitted: </span>{submittedAt ?? '—'}</Text>
        </Section>
        <Hr />
        <Text style={sub}>Call the customer back to schedule the $29 technician visit.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewLeadEmail,
  subject: (data: Record<string, any>) =>
    `New lead: ${data['name'] ?? 'Website'} — ${data['service'] ?? 'Service request'}`,
  displayName: 'New lead notification',
  to: 'pureflowcostumerservices@gmail.com',
  previewData: {
    name: 'John Miller',
    phone: '(404) 555-0142',
    zip: '30305',
    service: 'Air Duct Cleaning',
    source: 'hero',
    submittedAt: 'Aug 4, 2026, 4:12 PM',
  },
} satisfies TemplateEntry