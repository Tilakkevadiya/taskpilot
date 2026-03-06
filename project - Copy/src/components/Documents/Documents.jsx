import React, { useState } from 'react'
import { FileText, Upload, Search, Download, Trash2, File, Sparkles } from 'lucide-react'
import './Documents.css'

const Documents = () => {
  const [documents, setDocuments] = useState([
    { 
      id: 1, 
      name: 'Q4_Financial_Report.pdf', 
      type: 'pdf', 
      size: '2.4 MB', 
      uploaded: '2024-12-18',
      summary: 'Quarterly financial report showing revenue growth of 15%...',
      status: 'processed'
    },
    { 
      id: 2, 
      name: 'Project_Proposal.docx', 
      type: 'docx', 
      size: '1.8 MB', 
      uploaded: '2024-12-17',
      summary: 'Project proposal for new client engagement including timeline and budget...',
      status: 'processed'
    },
    { 
      id: 3, 
      name: 'Meeting_Minutes_Dec_15.pdf', 
      type: 'pdf', 
      size: '856 KB', 
      uploaded: '2024-12-15',
      summary: 'Meeting minutes from team standup covering project updates and blockers...',
      status: 'processed'
    },
  ])

  const [selectedDoc, setSelectedDoc] = useState(null)
  const [summaryText, setSummaryText] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const newDoc = {
        id: documents.length + 1,
        name: file.name,
        type: file.name.split('.').pop(),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploaded: new Date().toISOString().split('T')[0],
        summary: '',
        status: 'processing'
      }
      setDocuments([newDoc, ...documents])
      // Simulate processing
      setTimeout(() => {
        setDocuments(docs => docs.map(d => 
          d.id === newDoc.id ? { ...d, status: 'processed', summary: 'Document processed successfully. Click to generate summary.' } : d
        ))
      }, 2000)
    }
  }

  const generateSummary = async (docId) => {
    setIsSummarizing(true)
    // Simulate AI summarization
    setTimeout(() => {
      const summary = `This document contains important information about the project. Key points include:
      
1. Overview of the project scope and objectives
2. Timeline and milestones
3. Budget allocation and resources
4. Risk assessment and mitigation strategies
5. Next steps and action items

The document is well-structured and provides comprehensive details for stakeholders.`
      
      setSummaryText(summary)
      setDocuments(docs => docs.map(d => 
        d.id === docId ? { ...d, summary } : d
      ))
      setIsSummarizing(false)
    }, 2000)
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

      <div className="documents-layout">
        <div className="documents-list">
          <div className="documents-list-header">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search documents..." className="search-input" />
            </div>
          </div>
          <div className="documents-items">
            {documents.map(doc => (
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
            ))}
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
                  <button className="action-btn">
                    <FileText size={18} />
                    Extract Text
                  </button>
                  <button className="action-btn">
                    <Sparkles size={18} />
                    Key Points
                  </button>
                  <button className="action-btn">
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
    </div>
  )
}

export default Documents




