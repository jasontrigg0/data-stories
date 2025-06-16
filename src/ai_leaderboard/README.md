For ratings history:
Download benchmarks csv https://docs.google.com/spreadsheets/d/1HqUzsuFN6Jb91zNMAz7bmqmt2wB8KCsR3gkBlHEzDro/edit?gid=0#gid=0 and move to benchmark.csv in this directory.
Then run python3 ai_rating.py.
This generates models.csv and evals.csv in ../../web-app/src/assets/data for the best models tab
It also creates rating_history.csv in this directory to upload to flourish.studio and republish

--

For chatbot arena history:
First git lfs clone https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard to pull down the history
NOTE: need lfs above or else won't pull all the pickle files

Then
- run generate_ai_alltime.py to create alltime.csv
- run by_org.sh to generate alltime_by_org.csv
- run pivot_data.py to generate chatbot_arena_models.csv, chatbot_arena_orgs.csv
- upload chatbot_arena_models.csv, chatbot_arena_orgs.csv to flourish.studio and republish