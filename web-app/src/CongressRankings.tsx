import { useState } from 'react';
import { StandardTable } from './StandardTable';
import { Dropdown } from './Dropdown';
import { ToggleGroup } from './ToggleGroup';
import congressData from './assets/data/congress.json';

export default function CongressRankings() {
  const [selectedCongress, setSelectedCongress] = useState(119);
  const [selectedChamber, setSelectedChamber] = useState("Senate");

  const headers = [
    {label:"Name", key:"name"},
    {label:"Party Bias", key:"bias"}
  ];
  const selectedData = congressData[selectedCongress][selectedChamber];

  return (
    <>
      <div style={{"padding-left": "25px"}}>
        <div className="p-5">Ranking Senators and Congresspeople through history from most Conservative (negative scores) to most Liberal (positive scores). <a href="https://voteview.com/data" style={{"text-decoration": "underline"}}>Voting data</a> from the DW-Nominate team. Compare with their scores <a href="https://voteview.com/congress/senate" style={{"text-decoration": "underline"}}>here</a>.</div>
	<ToggleGroup title={"Chamber"} options={[{id: "Senate", label: "Senate"}, {id: "House", label: "House"}]} defaultOption={"Senate"} small={true} callback={setSelectedChamber}/>
        <Dropdown options={Object.keys(congressData).sort((x,y) => y-x)} defaultOption="119" callback={(option) => { setSelectedCongress(option); }} placeholder="Choose a Congress..." title="Congress:"/>
	
      </div>
      <StandardTable headers={headers} data={selectedData}/>
    </>
  )
}