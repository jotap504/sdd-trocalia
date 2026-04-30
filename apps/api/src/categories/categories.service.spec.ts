import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { DRIZZLE_TOKEN } from '../database/database.module'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function qb(result: unknown): any {
  const chain: any = {}
  ;['from', 'where', 'limit', 'orderBy'].forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain)
  })
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
  chain.catch = () => Promise.resolve(result)
  return chain
}

const mockDb = { select: jest.fn() }

const electronics = { id: 'cat-1', parentId: null, name: 'Electrónica', slug: 'electronica', isCollectible: false, icon: null, sortOrder: 0, isActive: true }
const phones     = { id: 'cat-2', parentId: 'cat-1', name: 'Celulares', slug: 'celulares', isCollectible: false, icon: null, sortOrder: 0, isActive: true }
const collectibles = { id: 'cat-3', parentId: null, name: 'Coleccionables', slug: 'coleccionables', isCollectible: true, icon: null, sortOrder: 1, isActive: true }
const comics     = { id: 'cat-4', parentId: 'cat-3', name: 'Comics', slug: 'comics', isCollectible: true, icon: null, sortOrder: 0, isActive: true }

const comicsAttr = { id: 'attr-1', categoryId: 'cat-4', key: 'editorial', label: 'Editorial', type: 'select', options: { values: ['Marvel', 'DC'] }, isRequired: true, sortOrder: 0 }

describe('CategoriesService', () => {
  let service: CategoriesService

  beforeEach(async () => {
    jest.resetAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
      ],
    }).compile()

    service = module.get<CategoriesService>(CategoriesService)
  })

  describe('getAll()', () => {
    it('returns flat list of active categories', async () => {
      mockDb.select.mockReturnValueOnce(qb([electronics, phones, collectibles, comics]))
      const result = await service.getAll()
      expect(result).toHaveLength(4)
    })
  })

  describe('getTree()', () => {
    it('builds a nested tree from flat categories', async () => {
      mockDb.select.mockReturnValueOnce(qb([electronics, phones, collectibles, comics]))
      const tree = await service.getTree()
      expect(tree).toHaveLength(2)  // 2 roots: electronica, coleccionables

      const elec = tree.find((n) => n.slug === 'electronica')!
      expect(elec.children).toHaveLength(1)
      expect(elec.children[0].slug).toBe('celulares')

      const coll = tree.find((n) => n.slug === 'coleccionables')!
      expect(coll.children).toHaveLength(1)
      expect(coll.children[0].slug).toBe('comics')
    })

    it('places orphan nodes (unknown parentId) at root', async () => {
      const orphan = { ...phones, parentId: 'nonexistent-parent' }
      mockDb.select.mockReturnValueOnce(qb([electronics, orphan]))
      const tree = await service.getTree()
      expect(tree).toHaveLength(2)
    })

    it('returns empty array when no categories', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      const tree = await service.getTree()
      expect(tree).toEqual([])
    })
  })

  describe('getBySlug()', () => {
    it('returns category without attributes when not collectible', async () => {
      mockDb.select.mockReturnValueOnce(qb([electronics]))
      const result = await service.getBySlug('electronica')
      expect(result.slug).toBe('electronica')
      expect(result.attributes).toEqual([])
    })

    it('returns collectible category with its attributes', async () => {
      mockDb.select
        .mockReturnValueOnce(qb([comics]))
        .mockReturnValueOnce(qb([comicsAttr]))
      const result = await service.getBySlug('comics')
      expect(result.isCollectible).toBe(true)
      expect(result.attributes).toHaveLength(1)
      expect(result.attributes[0].key).toBe('editorial')
    })

    it('throws NotFoundException when slug not found', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.getBySlug('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })
})
