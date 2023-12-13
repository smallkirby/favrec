import BskySettings from '@/components/settings/BskySettings';

export default function SettingsPage() {
  return (
    <>
      <div className="mx-auto w-full md:w-2/3">
        <h1 className="w-full border-b-[1px] border-slate-600 pb-2 text-3xl font-bold">
          Settings
        </h1>

        <div className="mt-8">
          <BskySettings />
        </div>
      </div>
    </>
  );
}
