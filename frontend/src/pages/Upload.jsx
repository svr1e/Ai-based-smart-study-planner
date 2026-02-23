import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../context/AuthContext'
import { uploadMaterial, getMaterials, deleteMaterial } from '../services/api'
import toast from 'react-hot-toast'
import { Upload as UploadIcon, FileText, Trash2, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'

export default function Upload() {
  const { user } = useAuth()
  const [subject, setSubject] = useState('')
  const [materials, setMaterials] = useState([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const fetchMaterials = async () => {
    try {
      const res = await getMaterials(user.userId)
      setMaterials(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchMaterials() }, [])

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setSelectedFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!selectedFile || !subject) {
      toast.error('Please select a file and enter a subject')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('userId', user.userId)
      formData.append('subject', subject)

      await uploadMaterial(formData)
      toast.success('Material uploaded and processed!')
      setSelectedFile(null)
      setSubject('')
      fetchMaterials()
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data || err.message))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id)
      toast.success('Deleted')
      fetchMaterials()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Study Material</h1>
        <p className="text-gray-500 mt-1">Upload PDFs or text files — AI will extract and analyze the content</p>
      </div>

      {/* Upload Card */}
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Mathematics, Physics, History..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
            ${selectedFile ? 'border-green-400 bg-green-50' : ''}`}
        >
          <input {...getInputProps()} />
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <p className="font-medium text-green-700">{selectedFile.name}</p>
              <p className="text-sm text-green-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadIcon className="w-10 h-10 text-gray-400" />
              <p className="font-medium text-gray-700">
                {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm text-gray-400">Supports PDF, TXT, MD (max 20MB)</p>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          className="btn-primary w-full"
          disabled={uploading || !selectedFile || !subject}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing with AI...
            </span>
          ) : 'Upload & Extract'}
        </button>
      </div>

      {/* Materials List */}
      {materials.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Your Study Materials ({materials.length})</h2>
          <div className="space-y-3">
            {materials.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{m.title}</p>
                    <p className="text-xs text-gray-500">{m.subject} • {new Date(m.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
