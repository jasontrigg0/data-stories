import React from 'react';
import newsStories from './newsitems.json';
import { Clock, User, Tag } from 'lucide-react';

export default function NewsFeed() {
  return (
    <div className="max-w-8xl mx-auto p-4">
      {/*<h1 className="text-2xl font-bold mb-6 text-center">Latest News</h1>*/}
      <div className="space-y-4">
        {newsStories.map((story,i) => (
          <NewsCard key={i} story={story} />
        ))}
      </div>
    </div>
  );
}

const NewsCard = ({story}) => {
  const polymarketUrl = "https://embed.polymarket.com/market.html?market="+story.polymarketTicker+"&amp;features=volume";

  return (
    <div className="flex w-full" style={{ width: '1300px' }}>
      <div className="flex bg-white rounded-lg shadow-sm overflow-hidden mb-4 h-40 w-full" style={{ height: '166px', margin: '10px' }}>
        <div className="w-2/4 bg-gray-200">
          <img src={story.imageUrl} alt={""} className="h-full w-full object-cover" />
        </div>
        <div className="w-3/4 p-4 flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center mb-1">
              <Tag size={14} className="text-blue-600 mr-1" />
              <span className="text-blue-600 text-xs font-semibold">{story.category}</span>
            </div>
            <a href={story.url}><h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2">{story.title}</h3></a>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <div className="flex items-center">
              <User size={12} className="mr-1" />
              <span>{story.source}</span>
            </div>
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              <span>{story.date}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="ml-4 flex flex-col items-end">
          <iframe id="iframe-prediction-market" class="prediction-market-iframe" src={polymarketUrl} width="400px" height="176px" frameborder="0"></iframe>
        </div>
      </div>
    </div>
  );      
}     