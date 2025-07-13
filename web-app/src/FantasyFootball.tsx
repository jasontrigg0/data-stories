import { useState } from 'react';
import { ToggleGroup } from './ToggleGroup';
import draftData from './assets/data/ff_draft_stats.json';

const FantasyFootball = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [teamCnt, setTeamCnt] = useState("10");
  const [scoring, setScoring] = useState("1");
  const [league, setLeague] = useState("espn");

  const key = [teamCnt,scoring,league].join("|");
  const tabs = getTabs(draftData[key]);

  return (
    <>
    <div style={{"padding-left": "25px"}}>
      <div className="p-5">Optimized Fantasy Football draft recommendations. Find the optimal strategy from running through every pick in each round. Underlying player scoring projections from <a href="https://www.fantasypros.com/nfl/projections/qb.php?week=draft" style={{"text-decoration": "underline"}}>Fantasy Pros</a>.</div>
      <ToggleGroup title={"League"} options={[{id: "espn", label: "ESPN"}, {id: "yahoo", label: "Yahoo"}]} defaultOption={"espn"} small={true} callback={setLeague}/>
      <ToggleGroup title={"Scoring"} options={[{id: "1", label: "PPR"}, {id:"0.5", label: "Half PPR"}, {id: "0", label: "Standard"}]} defaultOption={"1"} small={true} callback={setScoring}/>
      <ToggleGroup title={"Teams"} options={[{id: "8", label: "8"}, {id: "10", label: "10"}, {id: "12", label: "12"}]} defaultOption={"10"} small={true} callback={setTeamCnt}/>
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
  )
}

const Dropdown = ({options, callback, defaultOption}) => {
  const [selectedNumber, setSelectedNumber] = useState(defaultOption);

  const handleChange = (e) => {
    console.log(e.target.value);
    setSelectedNumber(e.target.value);
    callback(e.target.value);
  };

  return (
     <div className="p-6 max-w-md mx-auto">
      <select
        id="number-select"
        value={selectedNumber}
        onChange={handleChange}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Choose a Pick Order...</option>
        {options.map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  )
}

const StandardTable = ({headers, data}) => {
  return (<div>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
	<tr>
	  {headers.map((column, j) => (
	    <th key={j} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{column.label}</th>
	  ))}
	</tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
	{data.map((row, i) => (
	  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
	    {headers.map((column, j) => (
	       <td key={j} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{row[column.key]}</td>
	    ))}
	  </tr>
	))}
      </tbody>
    </table>
  </div>);
}

const DraftOrderTable = ({data}) => {
  const headers = [
    { key:"pick_num", label: "Rank"},
    { key:"name", label: "Player"},
    { key:"pos", label: "Position"},
    { key:"gap", label: "+/- vs league"},
  ];

  return (
  <>
    <div className="p-5">Calculating the value of each player</div>
    <StandardTable headers={headers} data={data}/>
  </>
  )
}

const StrategyList = ({data}) => {
  const [pickOrder, setPickOrder] = useState("1");

  const headers = [
    { key: "name", label: "Player" },
    { key: "position", label: "Position" },
    { key: "value", label: "Value" },
  ];

  console.log(pickOrder);

  return (
    <>
      <Dropdown options={Object.keys(data)} callback={(option) => { setPickOrder(option); }}/>
      <div className="px-6 max-w-md mx-auto">
	<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
	  <p className="text-blue-800">Total value: {data[pickOrder]["total_value"]}</p>
	</div>
      </div>
      <StandardTable headers={headers} data={data[pickOrder]["sample_picks"]}/>
    </>
  );
}

const getTabs = (data) => {
  return [
    {
      title: "Draft Order",
      content: (<DraftOrderTable data={data["player_ranking"]}/>)
    },
    {
      title: "Strategy by Draft Position",
      content: (<StrategyList data={data["draft_strategies"]}/>)
    },
  ];
};

export default FantasyFootball;