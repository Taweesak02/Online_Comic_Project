jest.mock('../src/configs/db', () => ({
    chapter: { findUnique: jest.fn() },
    chapterUnlock: { findFirst: jest.fn() },
    $transaction: jest.fn(),
}));

jest.mock('../src/modules/wallet/wallet.service', () => ({
    decreaseWallet: jest.fn(),
    increaseWallet: jest.fn(),
}));

const prisma = require('../src/configs/db');
const { decreaseWallet, increaseWallet } = require('../src/modules/wallet/wallet.service');
const { unlockChapter } = require('../src/modules/chapter/chapter.service');

beforeEach(() => jest.clearAllMocks());

test('deducts coins from the buyer and credits the comic owner when unlocking', async () => {
    prisma.chapter.findUnique.mockResolvedValue({
        id: 12,
        coinCost: 25,
        comic: { creatorId: 7 },
    });
    prisma.chapterUnlock.findFirst.mockResolvedValue(null);

    const tx = {
        coinWallet: {
            findUnique: jest
                .fn()
                .mockResolvedValueOnce({ id: 20, userId: 4, balance: 100 })
                .mockResolvedValueOnce({ id: 30, userId: 7, balance: 10 }),
        },
        chapterUnlock: {
            create: jest.fn().mockResolvedValue({ id: 99, chapterId: 12, userId: 4 }),
        },
    };
    prisma.$transaction.mockImplementation((callback) => callback(tx));

    await expect(unlockChapter(12, 4)).resolves.toEqual({
        id: 99,
        chapterId: 12,
        userId: 4,
    });

    expect(decreaseWallet).toHaveBeenCalledWith(20, 25, tx);
    expect(increaseWallet).toHaveBeenCalledWith(30, 25, tx, {
        transactionType: 'CREATOR_REWARD',
    });
    expect(tx.chapterUnlock.create).toHaveBeenCalledWith({
        data: { chapterId: 12, userId: 4 },
    });
});
