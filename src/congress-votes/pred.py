import csv
import math
import random

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def d_dx_sigmoid(x):
    return math.exp(-x) / (1 + math.exp(-x))**2

def load_data():
    reader = csv.DictReader(open("HSall_votes.csv"))
    votes = []
    cnt = 0
    for row in reader:
        if int(float(row["cast_code"])) not in [1,6]: continue
        #if row["chamber"] not in ["House","Senate"]: continue
        cnt += 1
        # if cnt > 100000: break
        votes.append({
            "id": "|".join([row["congress"],row["chamber"],row["rollnumber"]]),
            "member": str(int(float(row["icpsr"]))),
            "vote": 1 * (int(float(row["cast_code"])) == 1)
        })
    return votes

def simple_fit(data):
    training_data = []
    test_data = []

    random.seed(23432)
    RUN_VALIDATION = False
    for x in data:
        if (not RUN_VALIDATION) or random.random() < 0.8:
            training_data.append(x)
        else:
            test_data.append(x)

    congress_to_training_data = {}
    for x in training_data:
        congress_to_training_data.setdefault(int(x["id"].split("|")[0]),[]).append(x)

    all_votes = set()
    all_members = set()
    for x in data:
        all_votes.add(x["id"])
        all_members.add(x["member"])

    vote_to_scale = {vote: random.random() for vote in all_votes}
    vote_to_pop = {vote: random.random() for vote in all_votes}
    member_to_bias = {member: random.random() for member in all_members}

    RELOAD_CHECKPOINT = False
    if RELOAD_CHECKPOINT:
        reader = csv.DictReader(open("member_info.csv"))
        for row in reader:
            member_to_bias[row["member"]] = float(row["bias"])

        reader = csv.DictReader(open("vote_info.csv"))
        for row in reader:
            id_ = "|".join([row["congress"],row["rollnumber"]])
            vote_to_scale[id_] = float(row["scale"])
            vote_to_pop[id_] = float(row["pop"])
            
    ITERATIONS = 25
    step_size = 0.002

    for i in range(ITERATIONS):
        training_log_prob = 0
        test_log_prob = 0

        for congress in sorted(congress_to_training_data):
            print(congress)
            training_data = congress_to_training_data[congress]
            for i in range(5):
                vote_to_delta_scale = {vote:0 for vote in all_votes}
                vote_to_delta_pop = {vote:0 for vote in all_votes}
                member_to_delta_bias = {member:0 for member in all_members}

                for x in training_data:
                    offset = vote_to_pop[x["id"]] + member_to_bias[x["member"]] * vote_to_scale[x["id"]]
                    if x["vote"]:
                        log_prob = -1 * math.log(1 + math.exp(-offset))
                        ddx = 1/(1 + math.exp(offset))
                    else:
                        log_prob = -1 * math.log(1 + math.exp(offset))
                        ddx = -1/(1 + math.exp(-offset))
                        
                    if i == 0:
                        training_log_prob += log_prob

                    vote_to_delta_scale[x["id"]] += ddx * member_to_bias[x["member"]]
                    vote_to_delta_pop[x["id"]] += ddx
                    member_to_delta_bias[x["member"]] += ddx * vote_to_scale[x["id"]]

                if i == 0:
                    print(training_log_prob)
                    
                for vote in vote_to_delta_scale:
                    vote_to_scale[vote] += vote_to_delta_scale[vote] * step_size
                for vote in vote_to_delta_pop:
                    vote_to_pop[vote] += vote_to_delta_pop[vote] * step_size
                for member in member_to_delta_bias:
                    member_to_bias[member] += member_to_delta_bias[member] * step_size
                
        for x in test_data:
            offset = vote_to_pop[x["id"]] + member_to_bias[x["member"]] * vote_to_scale[x["id"]]
            if x["vote"]:
                test_log_prob += -1 * math.log(1 + math.exp(-offset))
            else:
                test_log_prob += -1 * math.log(1 + math.exp(offset))
            print(test_log_prob)

    writer = csv.DictWriter(open("vote_info.csv","w"), fieldnames=["congress","chamber","rollnumber","scale","pop","bias"])
    writer.writeheader()
    for k in vote_to_scale:
        writer.writerow({
            "congress": k.split("|")[0],
            "chamber": k.split("|")[1],
            "rollnumber": k.split("|")[2],
            "scale": vote_to_scale[k],
            "pop": vote_to_pop[k],
            "bias": - vote_to_pop[k] / vote_to_scale[k],
        })
    writer = csv.DictWriter(open("member_info.csv","w"), fieldnames=["member","bias"])
    writer.writeheader()
    for k in member_to_bias:
        writer.writerow({
            "member": k,
            "bias": member_to_bias[k]
        })
            
if __name__ == "__main__":
    data = load_data()
    simple_fit(data)
    
    #model:
    #p(vote,member) ~ sigmoid(c_vote + b_vote * b_member)
    #if the b_member are significantly positive then you'll
    #want the c_vote to have

    #sigmoid(vote_pop + (member_bias - vote_bias) * vote_scale)
