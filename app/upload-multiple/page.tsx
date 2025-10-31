'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { UploadedImageData, MultipleUploadResponse, ErrorResponse } from '@/types/upload.types';

export default function MultipleUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    if (filesArray.length > 10) {
      setError('You can only upload up to 10 images at a time.');
      return;
    }

    setSelectedFiles(filesArray);
    setError(null);

    // Generate previews
    Promise.all(
      filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    ).then(setPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image to upload.');
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
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Upload Multiple Images 
        </h1>
<a href="/auth/login">Login</a>

        {/* Upload Card */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
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
                hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected Images ({previews.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative h-32 bg-gray-100 rounded-lg overflow-hidden border"
                  >
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

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Upload Button */}
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

        {/* Uploaded Results */}
        {uploadedImages.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Uploaded Images ({uploadedImages.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={image.url}
                      alt={`Uploaded ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 text-xs text-gray-600">
                    <p className="truncate">
                      <strong>Public ID:</strong> {image.publicId}
                    </p>
                    <p>
                      <strong>Format:</strong> {image.format}
                    </p>
                    {image.width && image.height && (
                      <p>
                        <strong>Size:</strong> {image.width} × {image.height}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
