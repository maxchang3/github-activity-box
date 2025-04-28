import SearchIssues from '@/SearchIssues.graphql'
import { env } from '@/env'
import { SearchResponseSchema } from '@/schema'
import { graphql } from '@octokit/graphql'

const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `token ${env.GH_PAT}`,
    },
})

export const getIssues = async (author: string) => {
    return SearchResponseSchema.parse(
        await graphqlWithAuth(SearchIssues, {
            searchQuery: `author:${author} is:issue sort:updated-desc`,
        })
    )
}

export const getPRs = async (author: string) => {
    return SearchResponseSchema.parse(
        await graphqlWithAuth(SearchIssues, {
            searchQuery: `author:${author} is:pr sort:updated-desc`,
        })
    )
}
