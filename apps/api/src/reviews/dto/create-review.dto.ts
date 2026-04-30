import {
  IsString, IsNotEmpty, IsUUID, IsEnum, IsInt, Min, Max, IsOptional, IsBoolean, MaxLength,
} from 'class-validator'

export enum ReviewDirection {
  BUYER_TO_SELLER = 'buyer_to_seller',
  SELLER_TO_BUYER = 'seller_to_buyer',
}

export class CreateReviewDto {
  @IsUUID()
  listingId!: string

  @IsUUID()
  reviewedId!: string

  @IsEnum(ReviewDirection)
  direction!: ReviewDirection

  @IsInt()
  @Min(1)
  @Max(5)
  overallRating!: number

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comment?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
