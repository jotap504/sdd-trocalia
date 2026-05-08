import type { Job } from 'bullmq'
import type { SearchService, ListingDocument } from '../../search/search.service'

export type SearchIndexJobData =
  | { type: 'index'; listing: ListingDocument }
  | { type: 'delete'; listingId: string }

export async function processSearchIndex(
  job: Job<SearchIndexJobData>,
  searchService: SearchService,
): Promise<void> {
  if (job.data.type === 'index') {
    await searchService.indexListing(job.data.listing)
  } else {
    await searchService.deleteListing(job.data.listingId)
  }
}
