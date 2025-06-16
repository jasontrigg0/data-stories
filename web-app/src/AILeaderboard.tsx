import { useState } from 'react';
import modelData from './assets/data/models.json';
import evalData from './assets/data/evals.json';

const AILeaderboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
    <div style={{"padding-left": "25px"}}>
      <div>Tracking the road to AGI. Underlying benchmarks <a href="https://docs.google.com/spreadsheets/d/1HqUzsuFN6Jb91zNMAz7bmqmt2wB8KCsR3gkBlHEzDro" style={{"text-decoration": "underline"}}>here</a>.
      </div>
    </div>
    <div className="max-w-1400 mx-auto mt-6 rounded-lg shadow-md overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-3 px-6 font-medium text-sm focus:outline-none ${
              activeTab === index
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-500 hover:text-blue-500 bg-gray-50'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-white">
        {tabs.map((tab, index) => (
          <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

const BestModelList = () => {
  const modelHeaders = [
    {
      key: "model",
      label: "Model"
    },
    {
      key: "release_date",
      label: "Release Date"
    },
    {
      key: "rating",
      label: "Rating"
    }
  ];

  const currentData = 0;
  return (<div>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
	<tr>
	  {modelHeaders.map((column, j) => (
	    <th key={j} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{column.label}</th>
	  ))}
	</tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
	{modelData.map((row, i) => (
	  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
	    {modelHeaders.map((column, j) => (
	       <td key={j} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{row[column.key]}</td>
	    ))}
	  </tr>
	))}
      </tbody>
    </table>
  </div>);
}

const tabs = [
  {
    title: "Road to AGI",
    content: (<iframe src='https://flo.uri.sh/visualisation/23770620/embed' title='Interactive or visual content' class='flourish-embed-iframe' frameborder='0' scrolling='no' style={{width:"100%",height:"600px"}} sandbox='allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation'></iframe>)
  },
  {
    title: "Best Models",
    content: <BestModelList/>
  },
  {
    title: "Chatbot Arena History",
    content: (<iframe src='https://flo.uri.sh/visualisation/22378491/embed' title='Interactive or visual content' class='flourish-embed-iframe' frameborder='0' scrolling='no' style={{width:"100%",height:"600px"}} sandbox='allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation'></iframe>)
  }
];

export default AILeaderboard;