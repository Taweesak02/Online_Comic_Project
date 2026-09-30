import ManagementLayout from "../../components/layout/ManagementLayout";
import ComicDashboard from "./components/comic/ComicDashboard";
import AllComics from "./components/comic/AllComics";
import ReviewComics from "./components/comic/ReviewComics";
import InactiveComics from "./components/comic/InactiveComics";

import ComicEditorForm from "./components/comic/ComicEditorForm";
import PageHeader from "../../components/ui/PageHeader";
import useComicManagement from "./hooks/useComicManagement";

const items = [
    { id: 'dashboard', label: 'แดชบอร์ด', detail: 'ภาพรวมผลงานของคุณ' },
    { id: 'comics', label: 'การ์ตูนทั้งหมด', detail: 'แก้ไขเรื่องและจัดการตอน' },
    { id: 'review', label: 'การพิจารณา', detail: 'ตรวจสอบและส่งพิจารณาใหม่' },
    { id: 'inactive', label: 'ปิดใช้งานแล้ว', detail: 'ผลงานที่เก็บไว้' },
];

export default function ComicManagementPage() {
  const {
    activeSection, changeSection, comics, overview, overviewError,
    resubmittingId, loading, loadOverview, openCreate, openEdit,
    submitForReview, reviewComics, inactiveComics, manageChapters,
    formOpen, editingComic, handleEditorSuccess, error, message, closeForm,
  } = useComicManagement();

  const renderActiveSection = () => {
      if (loading) {
          return (
              <output className="block py-16 text-center text-[#666666]">
                กำลังโหลดการ์ตูน...
              </output>
          );
      }
      if (activeSection === "dashboard") {
          return (
              <ComicDashboard
                comics={comics}
                overview={overview}
                overviewError={overviewError}
                onRetry={loadOverview}
                onChange={changeSection}
                onCreate={openCreate}
              />
          );
      }
      if (activeSection === "review") {
          return (
              <ReviewComics
                comics={reviewComics}
                onEdit={openEdit}
                onManageChapters={manageChapters}
                onResubmit={submitForReview}
                resubmittingId={resubmittingId}
              />
          );
      }
      if (activeSection === "inactive") {
          return (
              <InactiveComics
                comics={inactiveComics}
                onEdit={openEdit}
                onManageChapters={manageChapters}
              />
          );
      }
      return (
          <AllComics
            comics={comics}
            onCreate={openCreate}
            onEdit={openEdit}
            onManageChapters={manageChapters}
            onResubmit={submitForReview}
            resubmittingId={resubmittingId}
          />
      );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader title="จัดการการ์ตูน" />
      <div>
        {error && (
        <p
          className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
        )}
        {message && (
          <output
            className="block mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {message}
          </output>
        )}
      </div>

      <ManagementLayout
        items={items}
        active={activeSection}
        onChange={changeSection}
        navLabel="เมนูจัดการการ์ตูน"
      >
          {renderActiveSection()}
      </ManagementLayout>

      {formOpen && (
        <ComicEditorForm
          key={editingComic?.id ?? editingComic?._id ?? 'new'}
          comic={editingComic}
          onClose={closeForm}
          onSuccess={handleEditorSuccess}
        />
      )}

    </main>
  );
}
