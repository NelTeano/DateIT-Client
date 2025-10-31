'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { UploadedImageData, MultipleUploadResponse, ErrorResponse } from '@/types/upload.types';

export default function MultipleUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    setSelectedFiles(filesArray);
    setError(null);

    // Create previews
    const newPreviews = filesArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then(setPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/upload-multiple`, {
        method: 'POST',
        body: formData,
      });

      const data: MultipleUploadResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as ErrorResponse).error || 'Upload failed');
      }

      setUploadedImages((data as MultipleUploadResponse).data);
      setSelectedFiles([]);
      setPreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Multiple Images Upload
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Multiple Images (Max 10)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
          </div>

          {/* Previews Grid */}
          {previews.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Previews ({previews.length}):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
              hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors font-medium"
          >
            {loading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
          </button>
        </div>

        {/* Uploaded Images Grid */}
        {uploadedImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Uploaded Images ({uploadedImages.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={image.url}
                      alt={`Uploaded ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{image.publicId}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}