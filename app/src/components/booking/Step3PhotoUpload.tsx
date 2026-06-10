import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useBookingStore } from '@/store/bookingStore';
import { Upload, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadApi } from '@/services/api';
import { toast } from 'sonner';

export default function Step3PhotoUpload({ onValidationChange }: { onValidationChange: (v: boolean) => void }) {
  const photos = useBookingStore((s) => s.photos);
  const addPhoto = useBookingStore((s) => s.addPhoto);
  const removePhoto = useBookingStore((s) => s.removePhoto);
  const updatePhotoStatus = useBookingStore((s) => s.updatePhotoStatus);
  const updatePhotoUrl = useBookingStore((s) => s.updatePhotoUrl);

  useEffect(() => {
    onValidationChange(true); // Always allow proceeding
  }, [onValidationChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);
      addPhoto({ id, file, url: previewUrl, serverUrl: '', aiDescription: '', status: 'uploading' });

      // Upload to server
      uploadApi.image(file)
        .then((data) => {
          updatePhotoStatus(id, 'analyzing');
          updatePhotoUrl(id, data.url);
          // Simulate AI analysis description
          const descriptions = [
            'Large beige sectional sofa, 3-piece, fabric upholstery',
            'Wooden dining table with 6 upholstered chairs, oak finish',
            'King-size bed frame with tufted headboard, platform style',
            'Coffee table with glass top, metal frame, rectangular',
            'Dresser with 6 drawers, dark walnut finish',
            'Bookshelf unit, 5-tier, white laminate',
            'TV stand/media console, 60-inch, espresso finish',
            'Accent chair, wingback style, velvet fabric',
            'Nightstand pair, 2-drawer, matching bedroom set',
            'Console table, entryway, narrow profile',
          ];
          const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
          setTimeout(() => {
            updatePhotoStatus(id, 'complete', desc);
          }, 800);
        })
        .catch((err) => {
          console.error('Photo upload failed:', err);
          updatePhotoStatus(id, 'complete');
          toast.error(`Photo upload failed: ${err.message}`);
        });
    });
  }, [addPhoto, updatePhotoStatus, updatePhotoUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const completedPhotos = photos.filter((p) => p.status === 'complete');
  const failedPhotos = photos.filter((p) => p.status === 'error');

  return (
    <div>
      <h2 className="text-heading-m text-[#0A1628]">SHOW US YOUR ITEMS</h2>
      <p className="text-body-m text-[#64748B] mt-1">
        Upload photos of the furniture. Our system analyzes them to help our crew prepare.
      </p>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`mt-6 border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-[#E63946] bg-[rgba(230,57,70,0.03)]'
            : 'border-[rgba(15,29,50,0.2)] bg-white hover:border-[#E63946]/50'
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={isDragActive ? { duration: 1, repeat: Infinity } : {}}
        >
          <Upload size={48} className="mx-auto text-[#64748B] mb-3" />
        </motion.div>
        <p className="font-display text-label text-[#0A1628]">Drag &amp; drop photos here</p>
        <p className="text-body-s text-[#64748B] mt-1">or click to browse — JPG, PNG, up to 10MB each</p>
        <button className="mt-4 px-6 py-2.5 rounded-lg border-2 border-[#0A1628] text-[#0A1628] font-display text-sm tracking-wider hover:bg-[#0A1628] hover:text-white transition-all">
          SELECT PHOTOS
        </button>
      </div>

      {/* Status badges */}
      {completedPhotos.length > 0 && (
        <div className="mt-4 inline-flex items-center gap-2 bg-[rgba(16,185,129,0.1)] rounded-full px-4 py-2">
          <span className="text-body-s text-[#10B981] font-medium">
            ✓ AI analysis complete — {completedPhotos.length} item{completedPhotos.length > 1 ? 's' : ''} identified
          </span>
        </div>
      )}
      {failedPhotos.length > 0 && (
        <div className="mt-2 inline-flex items-center gap-2 bg-red-500/10 rounded-full px-4 py-2">
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-body-s text-red-500 font-medium">
            {failedPhotos.length} photo{failedPhotos.length > 1 ? 's' : ''} failed to upload
          </span>
        </div>
      )}

      {/* Photo Grid */}
      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4"
          >
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-xl overflow-hidden group"
              >
                <img src={photo.url} alt="Uploaded" className="w-full aspect-[4/3] object-cover" />

                {/* Remove button */}
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#E63946] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <X size={14} />
                </button>

                {/* AI Description overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2">
                  {photo.status === 'analyzing' || photo.status === 'uploading' ? (
                    <div className="h-4 bg-gradient-to-r from-transparent via-[#CBD5E1] to-transparent bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
                  ) : (
                    <p className="text-[11px] text-[#0A1628] font-medium leading-tight">{photo.aiDescription}</p>
                  )}
                </div>

                {/* Status icon */}
                {photo.status !== 'complete' && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-body-s text-[#64748B] italic text-center mt-4">
        Tip: More photos = better preparation. Show us stairs, hallways, and doorways too!
      </p>
    </div>
  );
}
