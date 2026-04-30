import { IsString, IsNotEmpty, MaxLength } from 'class-validator'

export class RejectKycDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string
}
