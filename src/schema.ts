import { z } from 'zod'

const BasicSearchNodeSchema = z.object({
    type: z.enum(['Issue', 'PullRequest']),
    title: z.string(),
    repo: z.object({
        name: z.string(),
        owner: z.object({
            login: z.string(),
        }),
    }),
    number: z.number(),
    createdAt: z.coerce.date(),
    closedAt: z.nullable(z.coerce.date()),
})

const IssueNodeSchema = BasicSearchNodeSchema.extend({
    type: z.literal('Issue'),
    issueState: z.enum(['OPEN', 'CLOSED']),
})

const PullRequestNodeSchema = BasicSearchNodeSchema.extend({
    type: z.literal('PullRequest'),
    prState: z.enum(['OPEN', 'CLOSED', 'MERGED']),
})

export type IssueNode = z.infer<typeof IssueNodeSchema>
export type PullRequestNode = z.infer<typeof PullRequestNodeSchema>

// To keep the type non-expanded
export type SearchNode = IssueNode | PullRequestNode

const SearchNodeSchema: z.ZodType<SearchNode> = z.discriminatedUnion('type', [
    IssueNodeSchema,
    PullRequestNodeSchema,
])

export const SearchResponseSchema = z.object({
    search: z.object({
        edges: z.array(
            z.object({
                node: SearchNodeSchema,
            })
        ),
    }),
})

export type SearchResponse = z.infer<typeof SearchResponseSchema>
