import { SearchResponseSchema } from '@/schema'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Issues, PRs } from '~/fixtures'
const mockedUpdate = vi.fn()
const mockedConsoleError = vi.fn()

vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(mockedConsoleError)
// @ts-expect-error no need to throw
vi.spyOn(process, 'exit').mockImplementation(() => {})

vi.mock('gist-box', async (importOriginal) => {
    const actual = await importOriginal<typeof import('gist-box')>()
    return {
        ...actual,
        GistBox: vi.fn().mockImplementation(() => ({
            update: mockedUpdate,
        })),
    }
})

vi.mock('@/graphql', async () => ({
    getIssues: vi.fn().mockResolvedValue(
        SearchResponseSchema.parse({
            search: {
                edges: Issues,
            },
        })
    ),
    getPRs: vi.fn().mockResolvedValue(
        SearchResponseSchema.parse({
            search: {
                edges: PRs,
            },
        })
    ),
}))

describe('activity-box', () => {
    beforeEach(async () => {
        mockedUpdate.mockClear()
        vi.stubEnv('EXCLUDE_REPO', '')
        vi.stubEnv('EXCLUDE_OWNER', '')
        vi.stubEnv('ACTIVITY_TYPE', 'all')
    })

    const runAction = async () => {
        vi.resetModules()
        return await import('../src/index')
    }

    it('should update the Gist with the expected string', async () => {
        await runAction()
        expect(mockedUpdate).toHaveBeenCalledOnce()
        expect(mockedUpdate.mock.calls[0][0]).toMatchSnapshot()
    })

    it('should exclude repos listed in `EXCLUDE_REPO`', async () => {
        vi.stubEnv('EXCLUDE_REPO', 'clippy/should-be-filtered')

        await runAction()
        expect(mockedUpdate).toHaveBeenCalledOnce()
        expect(mockedUpdate.mock.calls[0][0]).toMatchSnapshot()
    })

    it('should exclude owners listed in `EXCLUDE_OWNER`', async () => {
        vi.stubEnv('EXCLUDE_OWNER', 'clippy')

        await runAction()
        expect(mockedUpdate).toHaveBeenCalledOnce()
        expect(mockedUpdate.mock.calls[0][0]).toMatchSnapshot()
    })

    it('should respect the `ACTIVITY_TYPE` filter', async () => {
        vi.stubEnv('ACTIVITY_TYPE', 'issue')
        await runAction()
        expect(mockedUpdate).toHaveBeenCalledOnce()
        expect(mockedUpdate.mock.calls[0][0]).toMatchSnapshot()
        expect(mockedUpdate.mock.calls[0][0]).not.toContain('PR')
    })

    it('should handle failure to update the Gist', async () => {
        mockedUpdate.mockImplementationOnce(() => {
            throw new Error('404')
        })

        await runAction()
        expect(mockedConsoleError).toHaveBeenCalledOnce()
        expect(mockedConsoleError.mock.calls[0][0]).toMatchSnapshot()
        expect(mockedUpdate).toHaveBeenCalled()
    })
})
