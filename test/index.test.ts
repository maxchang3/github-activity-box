import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Issues, PRs } from './fixtures/index.ts'
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

vi.mock('../src/graphql', async () => ({
    getIssues: vi.fn().mockResolvedValue({
        search: {
            edges: Issues,
        },
    }),
    getPRs: vi.fn().mockResolvedValue({
        search: {
            edges: PRs,
        },
    }),
}))

describe('activity-box', () => {
    beforeEach(async () => {
        mockedUpdate.mockClear()
    })

    const runAction = async () => {
        vi.resetModules()
        return await import('../src/index.ts')
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
