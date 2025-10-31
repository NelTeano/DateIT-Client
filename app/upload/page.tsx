'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { UploadedImageData, UploadResponse, DeleteResponse, ErrorResponse } from '@/types/upload.types';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImageData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });


      const data: UploadResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as ErrorResponse).error || 'Upload failed');
      }

      setUploadedImage((data as UploadResponse).data);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadedImage) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/delete/${uploadedImage.publicId}`,
        { method: 'DELETE', credentials: 'include' }
      );

      const data: DeleteResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as ErrorResponse).error || 'Delete failed');
      }

      setUploadedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Image Upload Demo
        </h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
              hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors font-medium"
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>

        {/* Uploaded Image Section */}
        {uploadedImage && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Uploaded Image
            </h2>

            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Image
                src={uploadedImage.url}
                alt="Uploaded"
                fill
                className="object-contain"
              />
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p>
                <strong>URL:</strong>{' '}
                <a 
                  href={uploadedImage.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {uploadedImage.url}
                </a>
              </p>
              <p><strong>Public ID:</strong> {uploadedImage.publicId}</p>
              <p><strong>Format:</strong> {uploadedImage.format}</p>
              <p><strong>Dimensions:</strong> {uploadedImage.width} x {uploadedImage.height}</p>
            </div>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md
                hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors font-medium"
            >
              {loading ? 'Deleting...' : 'Delete Image'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

