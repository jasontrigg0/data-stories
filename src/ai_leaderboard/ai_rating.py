import csv
import math
import json
import datetime
import calendar

NON_EVAL_COLUMNS = ["model","company","date","reasoning","notes","input price","output price"]

def is_field_percent(field, all_rows):
    for row in all_rows:
        if row[field] != "" and float(row[field]) > 100:
            return False
    return True

def load_benchmarks():
    reader = csv.DictReader(open("benchmarks.csv"))
    all_rows = [row for row in reader]

    all_models = [row["model"] for row in all_rows]
    model_to_info = {row["model"]:row for row in all_rows}
    all_evals = [field for field in reader.fieldnames if field not in NON_EVAL_COLUMNS]
    
    scores = [{"model":row["model"], "eval":eval_, "score":float(row[eval_])} for row in all_rows for eval_ in row if eval_ not in NON_EVAL_COLUMNS and row[eval_] != ""]

    is_eval_percent = {}
    for eval_ in all_evals:
        is_eval_percent[eval_] = is_field_percent(eval_, all_rows)

    return scores, model_to_info, all_evals, is_eval_percent

def normalize_scores(scores, all_evals, is_eval_percent):
    #doesn't have a big impact on results:
    for x in scores:
        if is_eval_percent[x["eval"]]:
            x["score"] = max(0.01,min(0.99, x["score"]/100)) #trim between 0.01 and 0.99
            x["score"] = math.log(x["score"] / (1-x["score"]))
            
    eval_to_mean = {}
    for eval_ in all_evals:
        eval_to_mean[eval_] = sum([res["score"] for res in scores if res["eval"] == eval_]) / len([res["score"] for res in scores if res["eval"] == eval_])

    eval_to_sd = {}
    for eval_ in all_evals:
        e_xsq = sum([res["score"]**2 for res in scores if res["eval"] == eval_]) / len([res["score"] for res in scores if res["eval"] == eval_])
        e_x = eval_to_mean[eval_]
        eval_to_sd[eval_] = (e_xsq - e_x**2) ** 0.5

    for x in scores:
        x["score"] -= eval_to_mean[x["eval"]]
        x["score"] /= eval_to_sd[x["eval"]]

    return eval_to_mean, eval_to_sd
    

def simple_fit(all_models, all_evals, scores):
    #predicted_score = model_rating * eval_scale + eval_offset
    #minimize (predicted_score - actual_score) ** 2
    model_to_rating = {model:0 for model in all_models}
    eval_to_offset = {eval_:0 for eval_ in all_evals}
    eval_to_scale = {eval_:1 for eval_ in all_evals}

    big_misses = {}
    
    #simple gradient descent, maybe try scipy.optimize?
    ITERATIONS = 100000
    step_size = 0.0025

    for i in range(ITERATIONS):
        # print("---")
        # print("---")
        # print("---")
        # print("iteration")
        model_to_delta_rating = {model:0 for model in all_models}
        eval_to_delta_offset = {eval_:0 for eval_ in all_evals}
        eval_to_delta_scale = {eval_:0 for eval_ in all_evals}
        total_err = 0
        for res in scores:
            rating = model_to_rating[res["model"]]
            scale = eval_to_scale[res["eval"]]
            offset = eval_to_offset[res["eval"]]
            err = rating * scale + offset - res["score"]
            if i>(ITERATIONS/2) and abs(err) > 1.5 and (res["model"], res["eval"]) not in big_misses:
                print(res, rating * scale + offset, err)
                big_misses[(res["model"], res["eval"])] = True
            # print(res)
            # print(rating, scale, offset, err)
            model_to_delta_rating[res["model"]] += 2 * err * scale
            eval_to_delta_offset[res["eval"]] += 2 * err
            eval_to_delta_scale[res["eval"]] += 2 * err * rating
            total_err += err**2

        if i%1000 == 0:
            print(total_err)
        
        for model in model_to_delta_rating:
            model_to_rating[model] -= model_to_delta_rating[model] * step_size
        #there are two extra degrees of freedom that are
        #fixed by leaving lmarena scale = 1 and offset = 0
        for eval_ in eval_to_delta_scale:
            if eval_ == "lmarena": continue
            eval_to_scale[eval_] -= eval_to_delta_scale[eval_] * step_size
        for eval_ in eval_to_delta_offset:
            if eval_ == "lmarena": continue
            eval_to_offset[eval_] -= eval_to_delta_offset[eval_] * step_size

        # print(model_to_rating)
        # print(eval_to_scale)
        # print(eval_to_offset)
    return model_to_rating, eval_to_scale, eval_to_offset

def denormalize_ratings(model_to_rating, eval_to_scale, eval_to_mean, eval_to_sd, eval_to_offset):
    for eval_ in eval_to_offset:
        eval_to_offset[eval_] = eval_to_offset[eval_] * eval_to_sd[eval_] + eval_to_mean[eval_] + model_to_rating["gpt 3.5"] * eval_to_scale[eval_] * eval_to_sd[eval_]
    for eval_ in eval_to_scale:
        eval_to_scale[eval_] *= eval_to_sd[eval_]

    baseline_val = model_to_rating["gpt 3.5"]
    for model in model_to_rating:
        model_to_rating[model] -= baseline_val

def write_models(model_to_rating, model_to_info, ratio):
    output_rows = []
    for model in model_to_rating:
        model_info = model_to_info[model]
        num_evals = [col for col in model_info if col not in NON_EVAL_COLUMNS and model_info[col] != ""]
        if len(num_evals) < 3: continue
        price = ""
        if model_to_info[model]["input price"] and model_to_info[model]["output price"]:
            input_price = float(model_to_info[model]["input price"])
            output_price = float(model_to_info[model]["output price"])
            price = 0.75 * input_price + 0.25 * output_price
        output_rows.append({
            "model": model,
            "company": model_to_info[model]["company"],
            "release_date": model_to_info[model]["date"],
            "rating": round(ratio * model_to_rating[model],1),
            "price": price
        })
    output_rows.sort(key=lambda x: x["rating"], reverse=True)
    leaders_over_time(output_rows)
    models_file_path = "../../web-app/src/assets/data/models.json"
    with open(models_file_path, mode='w', encoding='utf-8') as jsonfile:
        json.dump(output_rows, jsonfile, indent=4)

def get_eom(yyyymm):
    year = int(yyyymm[:4])
    month = int(yyyymm[4:])
    _, day = calendar.monthrange(year, month)
    return f"{year}{str(month).zfill(2)}{str(day).zfill(2)}"


def month_range(start_yyyymm, end_yyyymm):
    start_yyyy = int(start_yyyymm[:4])
    start_mm = int(start_yyyymm[4:])

    end_yyyy = int(end_yyyymm[:4])
    end_mm = int(end_yyyymm[4:])

    for year in range(start_yyyy, end_yyyy+1):
        for month in range(1, 13):
            if (year, month) < (start_yyyy, start_mm): continue
            if (year, month) > (end_yyyy, end_mm): continue
            yield f"{year}{str(month).zfill(2)}"
    
        
def leaders_over_time(model_rows):
    all_companies = list(set([x["company"] for x in model_rows]))
    
    start_yyyymm = "202211" #ChatGPT release
    end_yyyymm = datetime.datetime.today().strftime('%Y%m')

    time_to_status = []
    for yyyymm in month_range(start_yyyymm, end_yyyymm):
        yyyymmdd = get_eom(yyyymm)
        company_to_best = {}
        active_models = [x for x in model_rows if x["release_date"] <= yyyymmdd]
        for company in all_companies:
            company_models = [x for x in active_models if x["company"] == company]
            if company_models:
                company_to_best[company] = company_models[0]
        time_to_status.append({
            "date": yyyymmdd,
            "info": company_to_best
        })
    writer = csv.writer(open("rating_history.csv","w"))
    headers = ["Organization", "Icon"] + [datetime.datetime.strptime(x["date"],"%Y%m%d").strftime("%b %d, %Y") for x in time_to_status]
    writer.writerow(headers)

    company_to_icon = {
        "Anthropic": "https://www.anthropic.com/favicon.ico",
        "DeepSeek AI": "https://chat.deepseek.com/favicon.svg",
        "Google": "https://www.google.com/favicon.ico",
        "Meta": "https://static.xx.fbcdn.net/rsrc.php/y1/r/ay1hV6OlegS.ico",
        "OpenAI": "https://www.openai.com/favicon.ico",
        "xAI": "https://x.ai/favicon.ico"
    }
    
    for company in ["Anthropic", "DeepSeek AI", "Google", "Meta", "OpenAI", "xAI"]:
        row = [company, company_to_icon[company]] + [x["info"].get(company,{}).get("rating","") for x in time_to_status]
        writer.writerow(row)

        
def write_evals(model_to_info, eval_to_offset, eval_to_scale, is_eval_percent, ratio):
    output_rows = []
    for eval_ in eval_to_offset:
        diff = -1 * ratio * eval_to_offset[eval_] / eval_to_scale[eval_]
        
        num_evals = [model for model in model_to_info if model_to_info[model][eval_] != ""]
        if len(num_evals) < 3:
            diff = "N/A"
        if not is_eval_percent[eval_]:
            diff = "N/A"
        if abs(eval_to_scale[eval_]) < 0.25:
            diff = "N/A" #some evals don't have enough data to estimate properly
        output_rows.append({
            "eval": eval_,
            "difficulty": diff
        })

    def diff_to_val(diff):
        if diff == "N/A":
            return -math.inf
        else:
            return diff
    output_rows.sort(key=lambda x: diff_to_val(x["difficulty"]), reverse=True)
    evals_file_path = "../../web-app/src/assets/data/evals.json"
    with open(evals_file_path, mode='w', encoding='utf-8') as jsonfile:
        json.dump(output_rows, jsonfile, indent=4)
    
if __name__ == "__main__":
    scores, model_to_info, all_evals, is_eval_percent = load_benchmarks()
    
    eval_to_mean, eval_to_sd = normalize_scores(scores, all_evals, is_eval_percent)

    all_models = model_to_info.keys()
    model_to_rating, eval_to_scale, eval_to_offset = simple_fit(all_models, all_evals, scores)
    denormalize_ratings(model_to_rating, eval_to_scale, eval_to_mean, eval_to_sd, eval_to_offset)
        
    AGI_RATIO = 20
    write_models(model_to_rating, model_to_info, AGI_RATIO)
    write_evals(model_to_info, eval_to_offset, eval_to_scale, is_eval_percent, AGI_RATIO)
