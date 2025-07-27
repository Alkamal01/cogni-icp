import React, { useState } from 'react';
import { X, BookOpen, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../shared';
const MaterialsRepository = ({ isOpen, onClose, groupId, groupName }) => {
    // Mock folders
    const [folders] = useState([
        {
            id: '1',
            name: 'Course Slides',
            createdBy: 'John Doe',
            createdAt: new Date('2023-10-15'),
            description: 'All lecture slides and presentation materials'
        },
        {
            id: '2',
            name: 'Readings',
            createdBy: 'Jane Smith',
            createdAt: new Date('2023-10-17'),
            description: 'Required and supplementary reading materials'
        },
        {
            id: '3',
            name: 'Practice Problems',
            createdBy: 'Alex Johnson',
            createdAt: new Date('2023-10-20'),
            description: 'Exercises and practice problems with solutions'
        }
    ]);
    // Mock materials
    const [materials] = useState([
        {
            id: '1',
            name: 'Introduction to Machine Learning.pdf',
            type: 'pdf',
            size: '2.4 MB',
            uploadedBy: 'John Doe',
            uploadedAt: new Date('2023-10-16'),
            tags: ['ML', 'Intro', 'Week 1'],
            url: '#',
            folder: '1',
            description: 'Overview of machine learning concepts and techniques'
        },
        {
            id: '2',
            name: 'Neural Networks Architecture.ppt',
            type: 'ppt',
            size: '5.1 MB',
            uploadedBy: 'Jane Smith',
            uploadedAt: new Date('2023-10-18'),
            tags: ['Neural Networks', 'Architecture', 'Week 2'],
            url: '#',
            folder: '1'
        },
        {
            id: '3',
            name: 'Research Paper - Transformers.pdf',
            type: 'pdf',
            size: '1.7 MB',
            uploadedBy: 'Alex Johnson',
            uploadedAt: new Date('2023-10-21'),
            tags: ['Research', 'Transformers', 'Advanced'],
            url: '#',
            folder: '2'
        },
        {
            id: '4',
            name: 'Problem Set 1 with Solutions.doc',
            type: 'doc',
            size: '845 KB',
            uploadedBy: 'John Doe',
            uploadedAt: new Date('2023-10-22'),
            tags: ['Problems', 'Solutions', 'Week 1'],
            url: '#',
            folder: '3'
        }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFolder, setActiveFolder] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderDescription, setNewFolderDescription] = useState('');
    // Filter materials based on search query and active folder
    const filteredMaterials = materials.filter(material => {
        const matchesSearch = !searchQuery ||
            material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFolder = !activeFolder || material.folder === activeFolder;
        return matchesSearch && matchesFolder;
    });
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Study Materials</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{groupName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Folders */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Folders
                </h3>
                <ul className="space-y-1">
                  <li>
                    <button onClick={() => setActiveFolder(null)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeFolder === null
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      All Materials
                    </button>
                  </li>
                  {folders.map(folder => (<li key={folder.id}>
                      <button onClick={() => setActiveFolder(folder.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeFolder === folder.id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        {folder.name}
                      </button>
                    </li>))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button onClick={() => setShowCreateFolderModal(true)} variant="outline" fullWidth size="sm" className="justify-start">
                  <Plus className="h-4 w-4 mr-2"/>
                  New Folder
                </Button>
                <Button onClick={() => setShowUploadModal(true)} variant="outline" fullWidth size="sm" className="justify-start">
                  <ArrowRight className="h-4 w-4 mr-2"/>
                  Upload Files
                </Button>
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search and actions */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex space-x-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400"/>
                    </div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="Search materials..."/>
                  </div>
                </div>
              </div>
              
              {/* Materials list */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredMaterials.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No materials found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                      {searchQuery ? "Try adjusting your search query." : "Start by uploading study materials for your group."}
                    </p>
                    <Button onClick={() => setShowUploadModal(true)} variant="primary" size="sm">
                      <Plus className="h-4 w-4 mr-2"/>
                      Upload Material
                    </Button>
                  </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMaterials.map(material => (<div key={material.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4 relative group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                              {material.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {material.size} • Uploaded {formatDate(material.uploadedAt)}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                              <BookOpen className="h-4 w-4 text-gray-600 dark:text-gray-300"/>
                            </div>
                          </div>
                        </div>
                        
                        {material.description && (<p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {material.description}
                          </p>)}
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {material.tags.map((tag, index) => (<span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                              {tag}
                            </span>))}
                        </div>
                        
                        <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            By {material.uploadedBy}
                          </span>
                          <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                            View
                          </a>
                        </div>
                      </div>))}
                  </div>)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Folder</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="folder-name">
                  Folder Name
                </label>
                <input id="folder-name" type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Enter folder name"/>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="folder-description">
                  Description (Optional)
                </label>
                <textarea id="folder-description" value={newFolderDescription} onChange={(e) => setNewFolderDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none" placeholder="Enter folder description"/>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateFolderModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => {
                // Logic to create folder would go here
                setShowCreateFolderModal(false);
            }} disabled={!newFolderName.trim()}>
                Create Folder
              </Button>
            </div>
          </div>
        </div>)}

      {/* Upload Modal */}
      {showUploadModal && (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upload Materials</h3>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center">
                <BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-3"/>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Drag & drop files here</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">or</p>
                <Button size="sm">
                  Browse Files
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Folder
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="">-- Select a folder --</option>
                  {folders.map(folder => (<option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowUploadModal(false)}>
                Upload
              </Button>
            </div>
          </div>
        </div>)}
    </AnimatePresence>);
};
export default MaterialsRepository;
