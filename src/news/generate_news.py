import requests
from bs4 import BeautifulSoup
import json
import xmltodict
import os
import re
import datetime
from dateutil import tz
from googlenewsdecoder import gnewsdecoder
import math

def run_prompt_gemini(prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={os.environ['GEMINI_API_KEY']}"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent?key={os.environ['GEMINI_API_KEY']}"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key={os.environ['GEMINI_API_KEY']}"
    headers = {
        "Content-Type": "application/json"
    }

    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(response.status_code)
        raise

    return response.json()["candidates"][0]["content"]["parts"][0]["text"]

def get_google_news():
    xml_data = requests.get("https://news.google.com/rss").content
    doc = xmltodict.parse(xml_data)
    stories = {x["title"]: x for x in doc["rss"]["channel"]["item"]}
    return stories

def get_polymarkets():
    html = requests.get("https://polymarket.com").content
    soup = BeautifulSoup(html, features="lxml")

    data = json.loads(soup.select("script")[-1].text)
    #print(data.keys())


    queries = data["props"]["pageProps"]["dehydratedState"]["queries"]

    all_events = []

    def interest_fn(market):
        vol = market.get("volume24hr",0)
        logvol = math.log2(1+vol)
        price = float(market["outcomePrices"][0])
        price = min(max(price,0.01),0.99)
        uncertainty = - (1-price)*math.log2(1 - price) - price*math.log2(price)
        return logvol + uncertainty
    
    for i,q in enumerate(queries):
        data = q["state"]["data"]
        if "pages" in data:
            events = data["pages"][0]["events"]
        elif "events" in data:
            events = data["events"]
        else:
            continue

        for e in events:
            if e["closed"]:
                print(e)
                raise
            if e["ticker"] not in [e["ticker"] for e in all_events]:
                #when there are multiple submarkets link to the one with the highest volume
                #markets = sorted([m for m in e["markets"]], key = lambda x: x["outcomePrices"][0], reverse = True)
                markets = sorted([m for m in e["markets"]], key = lambda x: interest_fn(x), reverse = True)
                ticker = markets[0]["slug"] 
                all_events.append({
                    "title": e["title"],
                    "ticker": ticker,
                    "volume": e["volume24hr"]
                })

    markets = {e["title"]:e for e in all_events}
    return markets

def get_matches(news_stories, betting_markets):
    prompt = """
Given the following two lists of news stories and betting markets, could you pick out the news stories that are relevant to one of the betting markets? If there are many markets for a single news story please select just the top 1-3 markets. Please give your response in the following json format:
[{
    "news_story": TITLE_OF_NEWS_STORY,
    "betting_markets": LIST_OF_BETTING_MARKET_TITLES
}]
Thank you!

News stories: """+str(news_stories)+"""

Betting markets: """+str(betting_markets)

    raw_output = run_prompt_gemini(prompt)
    pattern = re.compile("```json(.*)```",re.MULTILINE|re.DOTALL)
    json_output = re.findall(pattern,raw_output)[0]

    return json_output

def get_categories(news_stories):
    prompt = """
Could you provide a list of news categories for each of the following news stories? Please give your response in the following json format:
[
    "news_story": TITLE_OF_NEWS_STORY,
    "category": NEWS_CATEGORY
]
Thank you!

News stories: """+str(news_stories)

    raw_output = run_prompt_gemini(prompt)
    pattern = re.compile("```json(.*)```",re.MULTILINE|re.DOTALL)
    json_output = re.findall(pattern,raw_output)[0]

    return json_output

def get_meta(soup, prop):
    out = soup.find('meta', {"property": prop})
    if out:
        return out.get("content")
    else:
        return ""

if __name__ == "__main__":
    news_stories = get_google_news()
    betting_markets = get_polymarkets()

    json_output = get_matches(list(news_stories.keys()), list(betting_markets.keys()))
    all_items = json.loads(json_output)
    
    html = ""

    output = []

    category_info = get_categories([item["news_story"] for item in all_items])
    for item in json.loads(category_info):
        print(item)
        news_stories[item["news_story"]]["category"] = item["category"]
        
    for item in all_items:
        story = news_stories.get(item["news_story"])
        if not story: continue

        valid_markets = [x for x in item["betting_markets"] if x in betting_markets]
        market = sorted(valid_markets, key = lambda x: betting_markets[x].get("volume",0), reverse=True)[0]

        print(story["link"])
        
        decoded_url = gnewsdecoder(story["link"], interval=1)["decoded_url"]
        try:
            response = requests.get(decoded_url, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            title = get_meta(soup,"og:title")
            description = get_meta(soup,"og:description")
            image_url = get_meta(soup,"og:image")
        except:
            title = ""
            description = ""
            image_url = ""

        #get date in the local timezone
        utc_time = datetime.datetime.strptime(story["pubDate"], "%a, %d %b %Y %H:%M:%S %Z")
        from_zone = tz.tzutc()
        to_zone = tz.tzlocal()
        local_time = utc_time.replace(tzinfo=from_zone).astimezone(to_zone)
        date = local_time.strftime("%B %d, %Y")
        
        output.append({
            "title": title or story["title"].rsplit("-",1)[0],
            "excerpt": description,
            "category": story["category"],
            "source": story["source"]["#text"],
            "date": date,
            "url": story["link"],
            "imageUrl": image_url,
            "polymarketTicker": betting_markets[market]["ticker"],
            "volume": betting_markets[market]["volume"]
        })

    output.sort(key = lambda x: x["volume"] * (x["imageUrl"] != ""), reverse=True)
        
    with open("../../web-app/src/newsitems.json","w") as f_out:
        f_out.write(json.dumps(output, indent=4))
