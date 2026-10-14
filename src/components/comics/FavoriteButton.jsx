import { addFavorite, getMyFavorites, removeFavorite } from '../../api/comicReaderApi';
import ComicCollectionButton from './ComicCollectionButton';

const config = {
    load: getMyFavorites, add: addFavorite, remove: removeFavorite,
    loadError: 'ไม่สามารถตรวจสอบรายการโปรดได้',
    saveError: 'ไม่สามารถอัปเดตรายการโปรดได้',
    loginLabel: 'เข้าสู่ระบบเพื่อเพิ่มรายการโปรด',
    selectedLabel: 'อยู่ในรายการโปรด', label: 'เพิ่มในรายการโปรด',
    onIcon: '♥', offIcon: '♡', iconClass: 'text-lg', spacing: 'mt-5',
    selectedClass: 'bg-red-50 text-red-700 hover:bg-red-100',
};

export default function FavoriteButton({ comicId, isLoggedIn, onFavoriteChange }) {
    return <ComicCollectionButton comicId={comicId} isLoggedIn={isLoggedIn} onChange={onFavoriteChange} config={config} />;
}
