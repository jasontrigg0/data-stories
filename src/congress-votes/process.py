import csv
import json

if __name__ == "__main__":
    id_to_bias = {}

    with open("member_info.csv","r") as f_in:
        reader = csv.DictReader(f_in)
        for row in reader:
            id_to_bias[row["member"]] = round(float(row["bias"]),3)

    congress_to_chamber_to_members = {}
    with open("HSall_members.csv","r") as f_in:
        reader = csv.DictReader(f_in)
        for row in reader:
            info = {
                "id": row["icpsr"],
                "name": row["bioname"],
                "bias": id_to_bias.get(row["icpsr"],""),
            }
            members = congress_to_chamber_to_members.setdefault(int(row["congress"]),{}).setdefault(row["chamber"],[])
            members.append(info)

    for congress in congress_to_chamber_to_members:
        for chamber in congress_to_chamber_to_members[congress]:
            congress_to_chamber_to_members[congress][chamber].sort(key = lambda x: 0 if x["bias"] == "" else x["bias"])
            for x in congress_to_chamber_to_members[congress][chamber]:
                x["bias"] = str(x["bias"])
            
    models_file_path = "../../web-app/src/assets/data/congress.json"
    with open(models_file_path, mode='w', encoding='utf-8') as jsonfile:
        json.dump(congress_to_chamber_to_members, jsonfile, indent=4)
