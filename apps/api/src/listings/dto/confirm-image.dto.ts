import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, MaxLength } from 'class-validator'

export class ConfirmImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  key!: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(19)
  sortOrder?: number
}

export class ReorderImagesDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  imageIds!: string[]
}
