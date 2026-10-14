import { followComic, getMyFollowedComics, unfollowComic } from '../../api/comicReaderApi';
import ComicCollectionButton from './ComicCollectionButton';

const config = {
    load: getMyFollowedComics, add: followComic, remove: unfollowComic,
    loadError: 'ไม่สามารถตรวจสอบสถานะการติดตามได้',
    saveError: 'ไม่สามารถอัปเดตการติดตามได้',
    loginLabel: 'เข้าสู่ระบบเพื่อติดตาม',
    selectedLabel: 'กำลังติดตาม', label: 'ติดตาม',
    onIcon: '✓', offIcon: '＋', spacing: 'mt-3',
    selectedClass: 'bg-[#213f68] text-white hover:bg-[#172e4d]',
};

export default function FollowButton({ comicId, followerCount = 0, isLoggedIn, onFollowChange }) {
    return <ComicCollectionButton comicId={comicId} isLoggedIn={isLoggedIn} onChange={onFollowChange} config={config} count={followerCount} />;
}
