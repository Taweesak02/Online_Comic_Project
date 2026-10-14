import ProfileImagePicker from './components/ProfileImagePicker';
import ProfileDetailsForm from './components/ProfileDetailsForm';
import ProfileEmailForm from './components/ProfileEmailForm';
import ProfilePasswordForm from './components/ProfilePasswordForm';
import useProfile from './hooks/useProfile';
import { Navigate } from 'react-router-dom';

export default function ProfilePage({ isLoggedIn, authReady, onUserChange }) {
    const {
        username, setUsername, imageFile, setImageFile, emailForm, setEmailForm, passwordForm,
        setPasswordForm, loading, saving, error, message, preview, submitProfile, submitEmail,
        submitPassword,
    } = useProfile({ isLoggedIn, onUserChange });

    if (!authReady) return <main className="py-20 text-center text-[#666666]">กำลังตรวจสอบบัญชีผู้ใช้...</main>;
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (loading) return <main className="py-20 text-center text-[#666666]">กำลังโหลดโปรไฟล์...</main>;

    return (
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
            <div className="mb-7">
                <p className="text-sm font-semibold text-[#213f68]">YOUR ACCOUNT</p>
                <h1 className="mt-1 text-3xl font-bold text-[#0d0c22]">โปรไฟล์ของคุณ</h1>
            </div>

            {error && <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
            {message && <output className="block mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</output>}

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <ProfileImagePicker
                    username={username}
                    preview={preview}
                    imageFile={imageFile}
                    setImageFile={setImageFile}
                />

                <div className="space-y-6">
                    <ProfileDetailsForm
                        username={username}
                        setUsername={setUsername}
                        saving={saving}
                        submitProfile={submitProfile}
                    />

                    <ProfileEmailForm
                        emailForm={emailForm}
                        setEmailForm={setEmailForm}
                        saving={saving}
                        submitEmail={submitEmail}
                    />

                    <ProfilePasswordForm
                        passwordForm={passwordForm}
                        setPasswordForm={setPasswordForm}
                        saving={saving}
                        submitPassword={submitPassword}
                    />
                </div>
            </div>
        </main>
    );
}
