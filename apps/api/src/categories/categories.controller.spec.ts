import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'

const mockCategoriesService = {
  getAll: jest.fn().mockResolvedValue([]),
  getTree: jest.fn().mockResolvedValue([]),
  getBySlug: jest.fn().mockResolvedValue({ id: 'cat-1', slug: 'electronica', attributes: [] }),
}

describe('CategoriesController', () => {
  let controller: CategoriesController

  beforeEach(async () => {
    jest.resetAllMocks()
    Object.assign(mockCategoriesService, {
      getAll: jest.fn().mockResolvedValue([]),
      getTree: jest.fn().mockResolvedValue([]),
      getBySlug: jest.fn().mockResolvedValue({ id: 'cat-1', slug: 'electronica', attributes: [] }),
    })

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockCategoriesService }],
    }).compile()

    controller = module.get<CategoriesController>(CategoriesController)
  })

  it('getAll() delegates to CategoriesService.getAll', async () => {
    await controller.getAll()
    expect(mockCategoriesService.getAll).toHaveBeenCalled()
  })

  it('getTree() delegates to CategoriesService.getTree', async () => {
    await controller.getTree()
    expect(mockCategoriesService.getTree).toHaveBeenCalled()
  })

  it('getBySlug() delegates with slug param', async () => {
    const result = await controller.getBySlug('electronica')
    expect(mockCategoriesService.getBySlug).toHaveBeenCalledWith('electronica')
    expect(result.slug).toBe('electronica')
  })
})
