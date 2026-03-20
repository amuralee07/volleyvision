import { VideoUpload } from "@/components/video-upload";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Footage</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your volleyball game or practice footage to get AI-powered analysis.
        </p>
      </div>
      <VideoUpload />
    </div>
  );
}
