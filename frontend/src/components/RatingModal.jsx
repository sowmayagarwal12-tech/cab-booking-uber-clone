import React, { useState } from 'react';
import { Star, Download, ThumbsUp, X } from 'lucide-react';
import { rideApi } from '../api/rideApi';

export default function RatingModal({ ride, onSubmit, onClose }) {
  const [stars, setStars] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Clean Car', 'Polite Driver']);
  const [downloading, setDownloading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const availableTags = [
    'Clean Car',
    'Polite Driver',
    'Great Route',
    'Smooth Driving',
    'Pleasant Music',
    'Arrived on Time'
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        rideId: ride.id,
        stars,
        comment,
        tags: selectedTags.join(', ')
      });
      onClose();
    } catch (err) {
      alert('Failed to submit rating: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      await rideApi.downloadInvoice(ride.id);
    } catch (err) {
      alert('Error downloading invoice: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/40">
            <ThumbsUp className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold">Rate Your Ride</h3>
          <p className="text-xs text-neutral-400 mt-1">
            How was your trip with {ride.driverName || 'your driver'}?
          </p>
        </div>

        {/* Interactive Star Picker */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((starNum) => (
            <button
              key={starNum}
              type="button"
              onMouseEnter={() => setHoveredStar(starNum)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setStars(starNum)}
              className="p-1 focus:outline-none transition-transform hover:scale-125"
            >
              <Star
                className={`w-9 h-9 transition-colors ${
                  starNum <= (hoveredStar || stars)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-600'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Badges / Feedback tags */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-neutral-300 block mb-2">What went well?</label>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    active
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-semibold'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  {active ? '✓ ' : ''}{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment box */}
        <div className="mb-5">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
            placeholder="Write a quick note for your driver (optional)..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition border border-neutral-700"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Downloading...' : 'PDF Invoice'}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-amber-500/30"
          >
            <span>{submitting ? 'Submitting...' : 'Submit Rating'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
