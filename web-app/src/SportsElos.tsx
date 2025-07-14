import { useState } from 'react';
import sportsData from './assets/data/sports_elos.json';
import moment from 'moment';

const sportsNames = {
  "all": "All Sports",
  "cbb": "College Basketball",
  "cfb": "College Football",
  "f1": "Formula 1",
  "golf": "Golf",
  "mlb": "MLB",
  "nba": "NBA",
  "nfl": "NFL",
  "nhl": "NHL",
  "ufc": "UFC",
  "cs": "Counter-Strike",
  "lol": "League of Legends",
}

const getScoreName = (sport) => {
  if (sport === "all") return "Pctile"
  if (sport === "golf") return "Strokes"
  if (sport === "f1") return "Total"
  return "ELO"
}

const getColumns = (sport) => {
  let headers = [
    {
      key: "rank",
      label: "Rank",
    },
    {
      key: "name",
      label: "Team",
    },
    {
      key: "displayDate",
      label: "Date",
    },
    {
      key: "score",
      label: getScoreName(sport),
    },
  ];

  if (sport === "all") {
    headers.splice(1,0,{
        key: "sport",
        label: "Sport",
    });
  }

  if (sport === "f1") {
    headers = headers.concat([
      {
        key: "player",
        label: "Driver",
      },
      {
        key: "chassis",
        label: "Chassis",
      },
      {
        key: "engine",
        label: "Engine",
      }
    ]);
  }

 return headers;
}

export default function SportsELOLeaderboard() {
  // State for selected sport and active tab
  const [selectedSport, setSelectedSport] = useState('mlb');
  const [activeTab, setActiveTab] = useState('current');

  // Get current data based on selections
  const currentData = sportsData[selectedSport][activeTab];
  for (let row of currentData) {
    row["displayDate"] = moment(row["date"], 'YYYYMMDD').format('MMM D, YYYY');
  }

  //move "all" to the front of the list
  let allSports = [].concat(["all"],Object.keys(sportsData).filter(x => x !== "all"));

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sports ELO Leaderboard</h1>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
        {/* Sport Selector */}
        <div className="w-full sm:w-64">
          <label htmlFor="sport-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Sport
          </label>
          <select
            id="sport-select"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            {allSports.map((sport) => (
              <option key={sport} value={sport}>{sportsNames[sport]}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex items-end">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'current'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Current Best
              </button>
              <button
                onClick={() => setActiveTab('alltime')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'alltime'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All-Time Best
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {getColumns(selectedSport).map((column, j) => (
                <th key={j} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {getColumns(selectedSport).map((column, j) => (
                   <td key={j} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}