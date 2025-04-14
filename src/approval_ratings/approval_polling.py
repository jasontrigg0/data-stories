import csv
import datetime
import re
import json

def process_row(row):
    output = {}
    output["sample_size"] = row["Sample"].split("@@")[1]
    output["sample_type"] = row["Sample"].split("@@")[0].split()[1]
    date_range_string = row["Dates"].split("@@")[0] #'2/7 - 2/13, 2025@@23785'
    year = date_range_string.split(",")[1].strip()
    start_date = date_range_string.split(",")[0].split("-")[0].strip()
    end_date = date_range_string.split(",")[0].split("-")[1].strip()
    start = datetime.datetime(year=int(year), month=int(start_date.split("/")[0]), day=int(start_date.split("/")[1]))
    end = datetime.datetime(year=int(year), month=int(end_date.split("/")[0]), day=int(end_date.split("/")[1]))
    output["start"] = start.strftime("%Y%m%d")
    output["end"] = end.strftime("%Y%m%d")
    output["Pollster"] = re.findall(">(.*?)<",row["Pollster"])[0]
    #fix a couple seeming errors in the Rasmussen weekly tracker
    if output["Pollster"] == "Rasmussen Reports" and output["start"] == "20250221" and output["end"] == "20250225":
        output["end"] = "20250227"
    if output["Pollster"] == "Rasmussen Reports" and output["start"] == "20250302" and output["end"] == "20250307":
        output["start"] = "20250303"
    output["Net"] = float(row["Net"])
    output["Total"] = float(row["Approve"]) + float(row["Disapprove"])
    return output

def deconvolve_rasmussen(rows, field):
    diffs = {}
    for i in range(len(rows)-1):
        last = rows[i]
        next_ = rows[i+1]
        weekday = datetime.datetime.strptime(last["start"],"%Y%m%d").weekday()
        delta = 5 * (next_[field] - last[field])
        diffs[next_["end"]] = (last["start"], delta)

    vals = {}
    first_val = rows[0][field]
    for r in rows:
        date_range = get_date_range(r["start"], r["end"])
        for dt in date_range:
            if dt in vals: continue
            if dt in diffs:
                prior, delta = diffs[dt]
                vals[dt] = vals[prior] + delta
            else:
                vals[dt] = first_val

    sum_by_weekday = {}
    cnt_by_weekday = {}
    mean_by_weekday = {}
    for dt in vals:
        weekday = datetime.datetime.strptime(dt,"%Y%m%d").weekday()        
        sum_by_weekday[weekday] = sum_by_weekday.get(weekday,0) + vals[dt]
        cnt_by_weekday[weekday] = cnt_by_weekday.get(weekday,0) + 1

    for weekday in cnt_by_weekday:
        mean_by_weekday[weekday] = sum_by_weekday[weekday] / cnt_by_weekday[weekday]

    overall_weekday_mean = sum(mean_by_weekday.values()) / len(mean_by_weekday.values())

    for dt in vals:
        weekday = datetime.datetime.strptime(dt,"%Y%m%d").weekday()        
        vals[dt] += overall_weekday_mean - mean_by_weekday[weekday]
    
    return vals

def get_date_range(start, end):
    #inclusive
    start_dt = datetime.datetime.strptime(start,"%Y%m%d")
    end_dt = datetime.datetime.strptime(end,"%Y%m%d")
    dt = start_dt
    date_range = []
    while dt <= end_dt:
        if dt.weekday() not in [5,6]:
            dt_str = dt.strftime("%Y%m%d")
            date_range.append(dt_str)
        dt += datetime.timedelta(days=1)
    return date_range

class PollingCalculator:
    def __init__(self, all_polls, config):
        self.all_polls = all_polls

        self.field = config["field"]
        self.start = config["start"]
        
        self.k = config["k"]
        self.k_mult = config["k_mult"]
        
        self.rv_k = config["rv_k"]
        self.rv_k_mult = config["rv_k_mult"]

        self.lv_k = config["lv_k"]
        self.lv_k_mult = config["lv_k_mult"]

        self.pollster_var_default = config["pollster_var_default"]
        self.pollster_var_k = config["pollster_var_k"]
        self.pollster_k = config["pollster_k"]
        self.pollster_k_mult = config["pollster_k_mult"]

        self.daily_k_mult = 0

        #factor for estimating poll variance
        self.sample_var_wt = 0
        self.pollster_var_wt = 0
        
        ##state vars
        self.history = {} #daily prediction value

        self.cnt = 0
        self.daily_cnt = {}
        
        self.err = 0
        self.var_err = 0

        self.rv_offset = 0
        self.rv_cnt = 0
        self.lv_offset = 0
        self.lv_cnt = 0

        self.pollster_offsets = {}
        self.pollster_cnts = {}
        self.pollster_vars = {}

        self.verbose = 0

        #NOTE: rasmussen releases polling *every day*
        #covering the last 5 business days

        #HOWEVER: haven't actually been able to make this useful
        #tried both the raw polls and "deconvolved" polls
        #ie self.rasmussen_deconvolve = 1

        #Neither seems to help reduce error at all for the non-rasmussen polls
        #ie when setting self.rasmussen_err_wt = 0 to only calculate
        #the errors of the non rasmussen polls it looks like we get the best
        #results with self.rasmussen_wt = 0
        self.rasmussen_deconvolve = 0
        self.rasmussen_wt = 0
        self.rasmussen_err_wt = 0
        
    def process_all_polls(self):
        rasmussen_history = []
        for poll in self.all_polls:
            if poll["Pollster"] == "Rasmussen Reports" and self.rasmussen_deconvolve:
                rasmussen_history.append(poll)
                rout = deconvolve_rasmussen(rasmussen_history, self.field)
                poll = {
                    **poll,
                    "start": poll["end"],
                    "end": poll["end"],
                    self.field: rout[poll["end"]]
                }
                #print(poll)
            self.process_poll(poll)
        print(self.err)

    def setup_history(self, date_range, pollster):
        for dt in date_range:
            if not self.history:
                self.history.setdefault(dt,self.start)
            else:
                last_day = max(self.history.keys())
                self.history.setdefault(dt, self.history[last_day])
            
        self.pollster_cnts.setdefault(pollster,0)
        self.pollster_vars.setdefault(pollster,self.pollster_var_default)

    def generate_pred(self, date_range, type_, pollster):
        pred = sum([self.history[dt] for dt in date_range]) / len(date_range)

        if type_ == "RV":
            pred += self.rv_offset
        elif type_ == "LV":
            pred += self.lv_offset
        elif type_ == "V": #only happens once or twice
            pass
        elif type_ == "A":
            pass
        else:
            print(type_)
            raise

        pred += self.pollster_offsets.setdefault(pollster,0)

        return pred

    def process_poll(self, output):
        date_range = get_date_range(output["start"], output["end"])

        type_ = output["sample_type"]
        pollster = output["Pollster"]
        
        self.setup_history(date_range, pollster)

        field_name = output[self.field]
        
        val = output[self.field]
        pred = self.generate_pred(date_range, type_, pollster)

        delta = val - pred

        err_wt = 1
        if pollster == "Rasmussen Reports":
            err_wt = self.rasmussen_err_wt
        
        self.err += err_wt * delta ** 2
        
        self.cnt += 1
        for dt in date_range:
            self.daily_cnt[dt] = self.daily_cnt.get(dt,0) + 1
        
        adj_k = self.k * (1 + self.k_mult / self.cnt)
        poll_variance = 1 + self.sample_var_wt/(int(output["sample_size"])**0.5) + self.pollster_var_wt*self.pollster_vars[pollster]
        weight = 1 / poll_variance

        if pollster == "Rasmussen Reports":
            weight *= self.rasmussen_wt
            
        if self.verbose:
            if output["Pollster"] != "Rasmussen Reports":
                print(output, round(pred,2), self.pollster_offsets[output["Pollster"]], output["sample_type"], self.rv_offset, self.lv_offset)
                if abs(delta) > 10:
                    print("-----")
                    print("-----")
                    print("-----")
                    print("-----")

        #update baseline
        for dt in date_range:
            daily_k = adj_k * (1 + self.daily_k_mult / self.daily_cnt[dt])
            self.history[dt] += daily_k * weight * delta

        #update poll types
        if type_ == "RV":
            self.rv_cnt += 1
            rv_k_adj = self.rv_k * (1 + self.rv_k_mult / self.rv_cnt)
            self.rv_offset += rv_k_adj * weight * delta
        elif type_ == "LV":
            self.lv_cnt += 1
            lv_k_adj = self.lv_k * (1 + self.lv_k_mult / self.lv_cnt)
            self.lv_offset += lv_k_adj * weight * delta

        #update pollsters
        self.pollster_cnts[pollster] += 1
        pollster_k_adj = self.pollster_k * (1 + self.pollster_k_mult / self.pollster_cnts[pollster])
        self.pollster_offsets[pollster] += pollster_k_adj * weight * delta
            
        # print(delta**2)
        # print((delta**2) - pollster_vars[pollster])
        # pollster_var_k_adj = self.pollster_var_k * (1 + pollster_k_mult / pollster_cnts[pollster])
        # pollster_vars[pollster] += pollster_var_k_adj * weight * ((delta**2) - pollster_vars[pollster])
        # var_err += ((delta**2) - pollster_vars[pollster])**2
        
        #print(output)
    
if __name__ == "__main__":
    with open("polls.csv") as f_in:
        all_raw_polls = [row for row in csv.DictReader(f_in)]
        all_polls = sorted([process_row(r) for r in all_raw_polls], key = lambda x: x["end"])

    net_config = {
        "field": "Net",
        "start": 0,
        "k": 0.15,
        "k_mult": 0.8,
        "rv_k": 0.06,
        "rv_k_mult": 4.5,
        "lv_k": 0.12,
        "lv_k_mult": 6,
        "pollster_var_default": 30,
        "pollster_var_k": 0.06,
        "pollster_k": 0.14,
        "pollster_k_mult": 3.5
    }
        
    net_calc = PollingCalculator(all_polls, net_config)
    net_calc.process_all_polls()

    total_config = {
        "field": "Total",
        "start": 100,
        "k": 0.08,
        "k_mult": 6,
        "rv_k": 0.00,
        "rv_k_mult": 1,
        "lv_k": 0.00,
        "lv_k_mult": 1,
        "pollster_var_default": 30,
        "pollster_var_k": 0.06,
        "pollster_k": 0.11,
        "pollster_k_mult": 4
    }
    total_calc = PollingCalculator(all_polls, total_config)
    total_calc.process_all_polls()
    
    # print(total_calc.history)
    # print(total_calc.pollster_offsets)

    #deconvolve_rasmussen([r for r in all_outputs if r["Pollster"] == "Rasmussen Reports"])

    output = []
    for day in sorted(list(net_calc.history.keys())):
        approve = (total_calc.history[day] + net_calc.history[day]) / 2
        disapprove = (total_calc.history[day] - net_calc.history[day]) / 2
        output.append({
            "date": day[:4] + "-" + day[4:6] + "-" + day[6:],
            "approve": round(approve,1),
            "disapprove": round(disapprove,1),
        })

    print(net_calc.pollster_offsets)
    print(net_calc.rv_offset)
    print(net_calc.lv_offset)
    
    with open("../../web-app/src/approval.json","w") as f_out:
        f_out.write(json.dumps(output, indent=4))
