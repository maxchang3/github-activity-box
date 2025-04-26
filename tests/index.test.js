import { beforeEach, expect, it, vi } from 'vitest'
import events from './fixtures/events.json'

const mockedUpdate = vi.fn()
const mockedConsoleError = vi.fn()

vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(mockedConsoleError)
vi.spyOn(process, 'exit').mockImplementation(() => {})

vi.mock('gist-box', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        GistBox: vi.fn().mockImplementation(() => ({
            update: mockedUpdate,
        })),
    }
})

vi.mock('@octokit/rest', () => ({
    Octokit: vi.fn().mockImplementation(() => ({
        activity: {
            listPublicEventsForUser: vi.fn().mockResolvedValue({
                data: events,
            }),
        },
    })),
}))

describe('activity-box', () => {
    beforeEach(async () => {
        mockedUpdate.mockClear()
    })

    const runAction = async () => {
        vi.resetModules()
        return await import('../index.js')
    }

    it('updates the Gist with the expected string', async () => {
        await runAction()
        expect(mockedUpdate).toHaveBeenCalledOnce()
        expect(mockedUpdate.mock.calls[0][0]).toMatchSnapshot()
    })

    it('handles failure to update the Gist', async () => {
        mockedUpdate.mockImplementationOnce(() => {
            throw new Error('404')
        })

        await runAction()
        expect(mockedConsoleError).toHaveBeenCalledOnce()
        expect(mockedConsoleError.mock.calls[0][0]).toMatchSnapshot()
        expect(mockedUpdate).toHaveBeenCalled()
    })
})
