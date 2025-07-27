import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Upload, Bookmark, Clock, List, Music } from 'lucide-react';
const Podcast = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(80);
    const [selectedPodcast, setSelectedPodcast] = useState(null);
    const featuredPodcasts = [
        {
            id: 1,
            title: 'Math Basics',
            duration: '45:30',
            author: 'Prof. Musa Yunus',
            thumbnail: '/api/placeholder/80/80'
        },
        {
            id: 2,
            title: 'Science Explained',
            duration: '32:15',
            author: 'Dr. Ibrahim Baffa',
            thumbnail: '/api/placeholder/80/80'
        },
        {
            id: 3,
            title: 'History Highlights',
            duration: '28:45',
            author: 'Dr. Mukhtar Dani',
            thumbnail: '/api/placeholder/80/80'
        }
    ];
    const handleFileUpload = (e) => {
        setUploadedFile(e.target.files[0]);
    };
    const handlePlayPodcast = (podcast) => {
        setSelectedPodcast(podcast);
        setIsPlaying(!isPlaying);
    };
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    return (<div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Audio Learning Platform</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your learning experience with our comprehensive audio library. Access expert-led podcasts or convert your reading materials into engaging audio content.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Podcasts */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center">
                <Music className="mr-2"/>
                Featured Podcasts
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                <List className="w-4 h-4 mr-1"/>
                View All
              </button>
            </div>
            <div className="space-y-4">
              {featuredPodcasts.map((podcast) => (<div key={podcast.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handlePlayPodcast(podcast)}>
                  <img src={podcast.thumbnail} alt={podcast.title} className="w-16 h-16 rounded-lg object-cover"/>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-900">{podcast.title}</h4>
                    <p className="text-sm text-gray-600">{podcast.author}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1"/>
                      {podcast.duration}
                    </div>
                  </div>
                  <button className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors" onClick={(e) => {
                e.stopPropagation();
                handlePlayPodcast(podcast);
            }}>
                    {isPlaying && selectedPodcast?.id === podcast.id ? (<Pause className="w-6 h-6"/>) : (<Play className="w-6 h-6"/>)}
                  </button>
                </div>))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Upload className="mr-2"/>
              Convert Text to Audio
            </h3>
            <div className="text-center">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <Upload className="w-12 h-12 mb-3 text-gray-400"/>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, or TXT (max. 10MB)</p>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt"/>
              </label>
            </div>
            {uploadedFile && (<div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6"/>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-600">Ready to convert</p>
                    </div>
                  </div>
                  <button onClick={() => handlePlayPodcast({ id: 'upload', title: uploadedFile.name })} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                  </button>
                </div>
              </div>)}
          </div>
        </div>

        {/* Audio Player */}
        {selectedPodcast && (<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src="/api/placeholder/48/48" alt={selectedPodcast.title} className="w-12 h-12 rounded-lg"/>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">{selectedPodcast.title}</h4>
                    <p className="text-sm text-gray-600">{selectedPodcast.author || 'Custom Upload'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-600 hover:text-gray-900">
                      <SkipBack className="w-5 h-5"/>
                    </button>
                    <button className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? (<Pause className="w-6 h-6"/>) : (<Play className="w-6 h-6"/>)}
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <SkipForward className="w-5 h-5"/>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-5 h-5 text-gray-600"/>
                    <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-24"/>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{formatTime(currentTime)}</span>
                    <div className="w-96 h-1 bg-gray-200 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(currentTime / 180) * 100}%` }}/>
                    </div>
                    <span className="text-sm text-gray-600">{selectedPodcast.duration || '3:00'}</span>
                  </div>

                  <button className="text-gray-600 hover:text-gray-900">
                    <Bookmark className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            </div>
          </div>)}
      </div>
    </div>);
};
export default Podcast;
