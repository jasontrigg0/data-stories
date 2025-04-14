First git clone https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard to pull down the history.

Then
- run generate_csv.py to create alltime.csv (note: requires python 3.9 or earlier, can use venv)
- run by_org.sh to generate alltime_by_org.csv
- run pivot_data.py to generate models.csv, orgs.csv
- upload models.csv, orgs.csv to flourish.studio and republish