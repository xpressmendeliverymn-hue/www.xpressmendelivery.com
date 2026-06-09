import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { ordersApi, uploadApi } from '@/services/api';
import { useDropzone } from 'react-dropzone';

export default function SalespersonUpload() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [order, setOrder] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'salesperson') { navigate('/'); return; }
    if (orderId) {
      ordersApi.get(orderId).then(setOrder).catch(() => navigate('/salesperson'));
    }
  }, [isAuthenticated, user, navigate, orderId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, 5);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
    setNotes((prev) => {
      const newNotes = [...prev];
      while (newNotes.length < newFiles.length) newNotes.push('');
      return newNotes;
    });
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 5,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newNotes = notes.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    setNotes(newNotes);
  };

  const handleUpload = async () => {
    if (!orderId || files.length === 0) return;
    setUploading(true);
    try {
      const { urls } = await uploadApi.images(files);
      for (let i = 0; i < urls.length; i++) {
        await ordersApi.uploadDeliveryPhoto(orderId, urls[i], notes[i] || undefined);
      }
      // Mark as delivered
      await ordersApi.updateStatus(orderId, 'delivered', 'Photos uploaded by salesperson');
      toast.success('Delivery photos uploaded and marked complete');
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'salesperson') return null;

  return (
    <div className="min-h-screen bg-[#0A1628] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/salesperson" className="text-sm text-[#64748B] hover:text-white flex items-center gap-1 mb-4">
            <ArrowLeft size={14} /> Back to Portal
          </Link>
          <h1 className="font-display text-heading-m text-white">UPLOAD DELIVERY PHOTOS</h1>
          {order && (
            <p className="text-body-m text-[#64748B] mt-1">Order {order.reference} · {order.contactInfo?.firstName} {order.contactInfo?.lastName}</p>
          )}
        </motion.div>

        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 bg-[#0F1D32] border border-green-500/30 rounded-2xl p-8 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-heading-s text-white">DELIVERY COMPLETE!</h2>
            <p className="text-[#64748B] mt-2">Photos uploaded and order marked as delivered.</p>
            <Link to="/salesperson" className="btn-primary inline-flex mt-6">
              Back to Portal
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 space-y-6">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-[#E63946] bg-[#E63946]/5' : 'border-white/20 hover:border-white/40'
              }`}
            >
              <input {...getInputProps()} />
              <Camera size={32} className="text-[#E63946] mx-auto mb-3" />
              <p className="text-white font-medium">Drop photos here or click to select</p>
              <p className="text-[#64748B] text-sm mt-1">Up to 5 images</p>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((preview, i) => (
                  <div key={i} className="relative">
                    <img src={preview} alt="" className="w-full h-32 object-cover rounded-xl" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-[#E63946] rounded-full flex items-center justify-center text-white"
                    >
                      <X size={12} />
                    </button>
                    <input
                      type="text"
                      placeholder="Add note..."
                      value={notes[i] || ''}
                      onChange={(e) => {
                        const newNotes = [...notes];
                        newNotes[i] = e.target.value;
                        setNotes(newNotes);
                      }}
                      className="mt-2 w-full text-xs bg-white/10 border border-white/10 rounded px-2 py-1 text-white placeholder:text-[#64748B]"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="w-full btn-primary justify-center"
            >
              <Upload size={18} />
              {uploading ? 'Uploading...' : 'Upload & Mark Delivered'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
