set -x

#news
cd news
python3 generate_news.py
cd ..

#approval ratings
cd approval_ratings
curl https://static.dwcdn.net/data/vknzT.csv?v=0 | sed 's/7\/31 - 7\/6/7\/31 - 8\/6/g' > polls.csv
python3 approval_polling.py
cd ..

#sports elos
cd sports_elos
python3 populate_data.py
cd ..

set +x

#cd ../../web-app
#npm run build
#npm run deploy
