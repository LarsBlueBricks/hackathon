# Scaffold — Feature Boilerplate Genereren

Genereer de volledige boilerplate voor een nieuwe feature volgens Blue Bricks patronen. De feature naam wordt als argument meegegeven.

**Feature naam:** $ARGUMENTS

## Naamgeving

Leid de namen af van het argument:
- **kebab-case** voor bestanden en directories: `user-management`
- **PascalCase** voor componenten en types: `UserManagement`
- **camelCase** voor functies en hooks: `useUserManagement`
- **Enkelvoud** voor het Prisma model: `UserManagement`
- **Meervoud** voor de API resource: `user-management` (in de URL)

## Backend bestanden

### `backend/src/types/[feature].types.ts`

Zod schemas en afgeleide TypeScript types:

```typescript
import { z } from 'zod'

export const create[Feature]Schema = z.object({
  // Velden op basis van de feature naam — maak een logische inschatting
})

export const update[Feature]Schema = create[Feature]Schema.partial()

export type Create[Feature] = z.infer<typeof create[Feature]Schema>
export type Update[Feature] = z.infer<typeof update[Feature]Schema>
```

### `backend/src/services/[feature].service.ts`

Business logic met Prisma queries:

```typescript
import { prisma } from '@/lib/prisma'
import type { Create[Feature], Update[Feature] } from '@/types/[feature].types'

export const findAll = async () => {
  return prisma.[model].findMany()
}

export const findById = async (id: string) => {
  return prisma.[model].findUnique({ where: { id } })
}

export const create = async (data: Create[Feature]) => {
  return prisma.[model].create({ data })
}

export const update = async (id: string, data: Update[Feature]) => {
  return prisma.[model].update({ where: { id }, data })
}

export const remove = async (id: string) => {
  return prisma.[model].delete({ where: { id } })
}
```

### `backend/src/routes/[feature].routes.ts`

Express router met CRUD endpoints:

```typescript
import { Router } from 'express'
import * as [feature]Service from '@/services/[feature].service'
import { create[Feature]Schema, update[Feature]Schema } from '@/types/[feature].types'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const data = await [feature]Service.findAll()
    res.json({ data })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const data = await [feature]Service.findById(req.params.id)
    if (!data) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: '[Feature] niet gevonden' } })
    }
    res.json({ data })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const parsed = create[Feature]Schema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }
    const data = await [feature]Service.create(parsed.data)
    res.status(201).json({ data })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = update[Feature]Schema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }
    const data = await [feature]Service.update(req.params.id, parsed.data)
    res.json({ data })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await [feature]Service.remove(req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export { router as [feature]Router }
```

### Tests

- `backend/src/services/[feature].service.test.ts` — Service tests met Prisma mock
- `backend/src/routes/[feature].routes.test.ts` — Route tests met supertest

## Frontend bestanden

### `frontend/src/types/[feature].types.ts`

Types die overeenkomen met de backend schemas.

### `frontend/src/services/[feature].service.ts`

API client met axios:

```typescript
import axios from 'axios'
import type { Create[Feature], Update[Feature], [Feature] } from '@/types/[feature].types'

const API_URL = '/api/[feature-plural]'

export const getAll = async (): Promise<[Feature][]> => {
  const { data } = await axios.get(API_URL)
  return data.data
}

export const getById = async (id: string): Promise<[Feature]> => {
  const { data } = await axios.get(`${API_URL}/${id}`)
  return data.data
}

export const create = async (input: Create[Feature]): Promise<[Feature]> => {
  const { data } = await axios.post(API_URL, input)
  return data.data
}

export const update = async (id: string, input: Update[Feature]): Promise<[Feature]> => {
  const { data } = await axios.put(`${API_URL}/${id}`, input)
  return data.data
}

export const remove = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`)
}
```

### `frontend/src/hooks/use[Feature].ts`

TanStack Query hook:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as [feature]Service from '@/services/[feature].service'

export const use[Feature]List = () => {
  return useQuery({
    queryKey: ['[feature]'],
    queryFn: [feature]Service.getAll,
  })
}

export const use[Feature] = (id: string) => {
  return useQuery({
    queryKey: ['[feature]', id],
    queryFn: () => [feature]Service.getById(id),
    enabled: !!id,
  })
}

export const useCreate[Feature] = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: [feature]Service.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['[feature]'] }),
  })
}

export const useUpdate[Feature] = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof [feature]Service.update>[1] }) =>
      [feature]Service.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['[feature]'] }),
  })
}

export const useDelete[Feature] = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: [feature]Service.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['[feature]'] }),
  })
}
```

### `frontend/src/components/[feature]/[Feature]List.tsx`

Lijst component met loading en error states:

```tsx
import { use[Feature]List } from '@/hooks/use[Feature]'

export const [Feature]List = () => {
  const { data, isLoading, error } = use[Feature]List()

  if (isLoading) return <div>Laden...</div>
  if (error) return <div>Er ging iets mis: {error.message}</div>
  if (!data?.length) return <div>Geen [feature] gevonden</div>

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{/* Render item velden */}</li>
      ))}
    </ul>
  )
}
```

### `frontend/src/components/[feature]/[Feature]Form.tsx`

Formulier met react-hook-form + Zod:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { create[Feature]Schema, type Create[Feature] } from '@/types/[feature].types'
import { useCreate[Feature] } from '@/hooks/use[Feature]'

export const [Feature]Form = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Create[Feature]>({
    resolver: zodResolver(create[Feature]Schema),
  })
  const createMutation = useCreate[Feature]()

  const onSubmit = (data: Create[Feature]) => {
    createMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields gebaseerd op schema */}
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Opslaan...' : 'Opslaan'}
      </button>
    </form>
  )
}
```

### `frontend/src/components/[feature]/[Feature]List.test.tsx`

Component test met Testing Library.

## Prisma model

Voeg een model toe aan `backend/prisma/schema.prisma`:

```prisma
model [Feature] {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // Velden op basis van de feature — maak een logische inschatting
}
```

Run daarna: `npx prisma generate`

## Instructies

1. Gebruik bovenstaande patronen als basis, maar pas de velden en logica aan op wat logisch is voor de opgegeven feature naam
2. Maak de directories aan als ze nog niet bestaan
3. Alle bestanden gebruiken named exports (geen default exports)
4. Schrijf basis tests bij de service en routes
5. Run `npx prisma generate` na het aanpassen van het schema
6. Geef aan het einde een overzicht van alle aangemaakte bestanden
