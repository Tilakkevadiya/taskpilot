import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { FileText, Upload, Search, Download, Trash2, File, Sparkles } from 'lucide-react'
import PremiumLock from '../UI/PremiumLock'
import { useUsage } from '../../context/UsageContext'
import './Documents.css'

const Documents = () => {
  const { decrementUsage } = useUsage()
  const [documents, setDocuments] = useState([])

  const [selectedDoc, setSelectedDoc] = useState(null)
  const [summaryText, setSummaryText] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const newDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.name.split('.').pop(),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploaded: new Date().toISOString().split('T')[0],
        summary: '',
        status: 'processing'
      }
      setDocuments([newDoc, ...documents])
      // Store the actual file object for later use
      newDoc.rawFile = file;
      
      // Simulate processing
      setTimeout(() => {
        setDocuments(docs => docs.map(d =>
          d.id === newDoc.id ? { ...d, status: 'processed' } : d
        ))
      }, 2000)
    }
  }

  const generateSummary = async (docId) => {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return

    setIsSummarizing(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData();
      
      if (doc.rawFile) {
        formData.append('file', doc.rawFile);
      } else {
        formData.append('content', `Document Title: ${doc.name}. (Content extraction placeholder)`);
      }

      const response = await axios.post('http://localhost:8080/api/ai/summarize', 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )
      
      const summary = response.data.summary
      setSummaryText(summary)
      setDocuments(docs => docs.map(d =>
        d.id === docId ? { ...d, summary } : d
      ))
      decrementUsage('documents')
      toast.success("Summary generated!")
    } catch (error) {
      console.error('Summarization failed:', error)
      toast.error("Failed to generate summary")
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleExtractText = async (docId) => {
    const doc = documents.find(d => d.id === docId)
    if (!doc || !doc.rawFile) {
        toast.error("File not available for extraction")
        return
    }

    setIsSummarizing(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', doc.rawFile)

      const response = await axios.post('http://localhost:8080/api/ai/extract-text', 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )
      
      setSummaryText(response.data.text)
      toast.success("Text extracted!")
    } catch (error) {
      console.error('Extraction failed:', error)
      toast.error("Failed to extract text")
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleKeyPoints = async (docId) => {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return

    setIsSummarizing(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      if (doc.rawFile) formData.append('file', doc.rawFile)
      else formData.append('content', `Document: ${doc.name}`)

      const response = await axios.post('http://localhost:8080/api/ai/key-points', 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )
      
      setSummaryText(response.data.points)
      toast.success("Key points generated!")
    } catch (error) {
      console.error('Key points failed:', error)
      toast.error("Failed to generate key points")
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleExportSummary = () => {
    if (!summaryText) {
      toast.error("No summary to export")
      return
    }
    const element = document.createElement("a");
    const file = new Blob([summaryText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDoc?.name || 'summary'}_analysis.txt`;
    document.body.appendChild(element);
    element.click();
    toast.success("Summary exported!")
  }

  const deleteDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id))
    if (selectedDoc?.id === id) {
      setSelectedDoc(null)
      setSummaryText('')
    }
  }

  const getFileIcon = (type) => {
    return <FileText size={24} />
  }

  return (
    <div className="content-area documents-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Upload, process, and summarize your documents with AI</p>
        </div>
        <label className="btn btn-primary" htmlFor="file-upload">
          <Upload size={18} />
          Upload Document
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      <PremiumLock featureName="Document Intelligence">
        <div className="documents-layout">
          <div className="documents-list">
            <div className="documents-list-header">
              <div className="search-box">
                <Search size={18} />
                <input type="text" placeholder="Search documents..." className="search-input" />
              </div>
            </div>
            <div className="documents-items">
              {documents.length === 0 ? (
                <div className="documents-empty-list">
                  <FileText size={48} color="var(--text-muted)" />
                  <p>📂 No documents uploaded yet. Upload your first document to start using AI document processing.</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div
                    key={doc.id}
                    className={`document-item ${selectedDoc?.id === doc.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDoc(doc)
                      setSummaryText(doc.summary || '')
                    }}
                  >
                    <div className="document-icon">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="document-info">
                      <h4>{doc.name}</h4>
                      <div className="document-meta">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploaded}</span>
                      </div>
                      {doc.status === 'processing' && (
                        <span className="status-badge processing">Processing...</span>
                      )}
                    </div>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteDocument(doc.id)
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="document-detail">
            {selectedDoc ? (
              <div className="document-detail-content">
                <div className="document-detail-header">
                  <div className="document-detail-title">
                    <div className="document-icon large">
                      {getFileIcon(selectedDoc.type)}
                    </div>
                    <div>
                      <h2>{selectedDoc.name}</h2>
                      <div className="document-detail-meta">
                        <span>Size: {selectedDoc.size}</span>
                        <span>•</span>
                        <span>Uploaded: {selectedDoc.uploaded}</span>
                      </div>
                    </div>
                  </div>
                  <div className="document-detail-actions">
                    <button className="btn btn-secondary">
                      <Download size={18} />
                      Download
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => generateSummary(selectedDoc.id)}
                      disabled={isSummarizing || selectedDoc.status === 'processing'}
                    >
                      <Sparkles size={18} />
                      {isSummarizing ? 'Summarizing...' : 'Generate Summary'}
                    </button>
                  </div>
                </div>

                <div className="summary-section">
                  <h3>AI Summary</h3>
                  {summaryText ? (
                    <div className="summary-content">
                      {summaryText}
                    </div>
                  ) : (
                    <div className="summary-placeholder">
                      <Sparkles size={32} color="var(--text-muted)" />
                      <p>Click "Generate Summary" to create an AI-powered summary of this document</p>
                      <span>You can also use natural language: "Summarize this document" or "What are the key points?"</span>
                    </div>
                  )}
                </div>

                <div className="document-actions-section">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button 
                      className="action-btn"
                      onClick={() => handleExtractText(selectedDoc.id)}
                      disabled={isSummarizing}
                    >
                      <FileText size={18} />
                      Extract Text
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => handleKeyPoints(selectedDoc.id)}
                      disabled={isSummarizing}
                    >
                      <Sparkles size={18} />
                      Key Points
                    </button>
                    <button 
                      className="action-btn"
                      onClick={handleExportSummary}
                    >
                      <File size={18} />
                      Export Summary
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="document-empty">
                <FileText size={48} color="var(--text-muted)" />
                <p>Select a document to view details and generate summary</p>
              </div>
            )}
          </div>
        </div>
      </PremiumLock>
    </div>
  )
}

export default Documents




