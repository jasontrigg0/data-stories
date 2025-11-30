import { useState } from 'react';
import { ToggleGroup } from './ToggleGroup';
import { StandardTable } from './StandardTable';
import { Dropdown } from './Dropdown';
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
      <div className="p-5">Optimized Fantasy Football draft recommendations determined by testing all pick orders. Underlying player scoring projections from <a href="https://www.fantasypros.com/nfl/projections/qb.php?week=draft" style={{"text-decoration": "underline"}}>Fantasy Pros</a>.</div>
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

const DraftOrderTable = ({data}) => {
  const headers = [
    { key:"pick_num", label: "Rank"},
    { key:"name", label: "Player"},
    { key:"pos", label: "Position"},
    { key:"gap", label: "+/- vs league"},
  ];

  return (
  <>
    <div className="p-5">Calculating the "true value" of each player in this format. The +/- column shows which players are bargains compared to standard draft lists. For instance Davante Adams and Lamar Jackson are often undervalued.</div>
    <StandardTable headers={headers} data={data}/>
  </>
  )
}

const StrategyList = ({data}) => {
  const [draftPosition, setDraftPosition] = useState("1");

  const headers = [
    { key: "round", label: "Round" },
    { key: "name", label: "Player" },
    { key: "position", label: "Position" },
    { key: "value", label: "Value" },
  ];

  if (parseInt(draftPosition) > Object.keys(data).length && Object.keys(data).length > 1) {
    setDraftPosition("1");
    return <></>;
  }

  let picks = data[draftPosition]["sample_picks"];
  picks.forEach((x,i) => x["round"] = i+1);

  return (
    <>
      <p>Sample draft for each draft position, assuming a 1 QB, 2 RB, 2 WR, 1 TE, 1 Flex roster.</p>
      <Dropdown options={Object.keys(data)} callback={(option) => { setDraftPosition(option); }} placeholder="Choose a Draft Position..." center={true}/>
      <div className="px-6 max-w-md mx-auto">
	<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
	  <p className="text-blue-800">Total points drafted: {data[draftPosition]["total_value"]}</p>
	</div>
      </div>
      <StandardTable headers={headers} data={picks}/>
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