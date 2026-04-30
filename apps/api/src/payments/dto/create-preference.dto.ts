import { IsString, IsIn } from 'class-validator'

export const TOKEN_PACKAGES = {
  tokens_10: { tokens: 10, amount: 500, description: '10 tokens' },
  tokens_25: { tokens: 25, amount: 1100, description: '25 tokens' },
  tokens_50: { tokens: 50, amount: 1900, description: '50 tokens' },
} as const

export type PackageId = keyof typeof TOKEN_PACKAGES

export class CreatePreferenceDto {
  @IsString()
  @IsIn(Object.keys(TOKEN_PACKAGES))
  packageId!: PackageId
}
