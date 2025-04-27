import 'dotenv/config'
import { z } from 'zod'

const commaSeparatedString = z
    .string()
    .transform((val) => val.split(',').map((x) => x.trim()))
    .default('')

const envSchema = z.object({
    GIST_ID: z.string(),
    GH_USERNAME: z.string(),
    GH_PAT: z.string(),
    EXCLUDE_REPO: commaSeparatedString,
    EXCLUDE_OWNER: commaSeparatedString,
    DESCRIPTION: z.string().optional(),
})

export const env = envSchema.parse(process.env)
