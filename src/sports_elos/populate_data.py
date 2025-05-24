import csv
import json
import glob

def add_rank(data):
    return [{"rank":i+1,**r} for i,r in enumerate(data)]

def read_csv(csv_filepath):
    data = []
    with open(csv_filepath, mode='r', encoding='utf-8') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            data.append(row)
    return data

# Example usage:
data = {}

best_curr = []
best_alltime = []
for sport in ["cbb","cfb","f1","golf","mlb", "nba", "nfl", "nhl", "ufc", "cs"]:
    data[sport] = {}
    curr_raw = f'../../../sports-elos-2/scores/{sport}_curr_raw.csv'
    data[sport]["current"] = read_csv(curr_raw)[:500]
    data[sport]["current"] = add_rank(data[sport]["current"])

    curr_adj = f'../../../sports-elos-2/scores/{sport}_curr_adj.csv'
    for x in read_csv(curr_adj):
        x["sport"] = sport
        best_curr.append(x)
        
    best_raw = f'../../../sports-elos-2/scores/{sport}_best_raw.csv'
    data[sport]["alltime"] = read_csv(best_raw)[:500]
    data[sport]["alltime"] = add_rank(data[sport]["alltime"])

    alltime_adj = f'../../../sports-elos-2/scores/{sport}_best_adj.csv'
    for x in read_csv(alltime_adj):
        x["sport"] = sport
        best_alltime.append(x)

data["all"] = {}
data["all"]["current"] = sorted(best_curr,key = lambda x: float(x["score"]), reverse=True)[:100]
data["all"]["current"] = add_rank(data["all"]["current"])
for x in data["all"]["current"]:
    decimals = 2 if 100*float(x["score"]) > 99 else 1
    x["score"] = str(round(100*float(x["score"]),decimals))
    
data["all"]["alltime"] = sorted(best_alltime,key = lambda x: float(x["score"]), reverse=True)[:100]
data["all"]["alltime"] = add_rank(data["all"]["alltime"])
for x in data["all"]["alltime"]:
    decimals = 2 if 100*float(x["score"]) > 99 else 1
    x["score"] = str(round(100*float(x["score"]),decimals))

json_file_path = f'../../web-app/src/assets/data/sports_elos.json'
with open(json_file_path, mode='w', encoding='utf-8') as jsonfile:
    json.dump(data, jsonfile, indent=4)
