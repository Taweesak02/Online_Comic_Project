import NameManager from './NameManager';

export default function TaxonomyManagement ({ data, submitting, actions }) {
    return (
        <section>
            <p className="text-sm font-semibold text-[#213f68]">CONTENT ORGANIZATION</p>
            <h2 className="mt-1 text-2xl font-bold">แท็กและหมวดหมู่</h2>
            <p className="mt-1 text-sm text-[#666666]">จัดระเบียบเนื้อหาและช่วยให้ค้นหาการ์ตูนได้ง่ายขึ้น</p>
            <div className="mt-6 flex gap-2 xl:grid-cols-2">
                <NameManager title="หมวดหมู่" description="สร้างหมวดหมู่สำหรับจัดกลุ่มการ์ตูน" items={data.categories} submitting={submitting === 'หมวดหมู่'} onCreate={actions.createCategory} onEdit={actions.editCategory} onDelete={actions.deleteCategory} />
                <NameManager title="แท็ก" description="สร้างแท็กสำหรับช่วยค้นหาการ์ตูน" items={data.tags} submitting={submitting === 'แท็ก'} onCreate={actions.createTag} onEdit={actions.editTag} onDelete={actions.deleteTag} />
            </div>
        </section>
    );
}
